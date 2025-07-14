import { ButtonInteraction } from "discord.js";
import { ObjectId } from "bson";
import getCollectionManager from "lib/getCollectionManager";
import { getMongoClient } from "lib/getMongoClient";
import { requirePrimarySave } from "./utils";
import CollectionId from "lib/types/CollectionId";
import { ItemInstance } from "lib/types/item";
import items from "lib/gamedata/items";
import { getFromOptionalFunc, restoreFieldsAndMethods } from "lib/utils";
import { PlayerInstance } from "lib/types/entities/player";

const buttons: Record<
  string,
  (interaction: ButtonInteraction, data: string) => Promise<void>
> = {
  sellOrder: async (interaction, data) => {
    const playerInstance = await requirePrimarySave(interaction);
    if (!playerInstance) return;

    const orderId = new ObjectId(data);

    const collectionManager = getCollectionManager(await getMongoClient());
    const buyOrder = await collectionManager
      .getCollection(CollectionId.BuyOrders)
      .get(orderId);
    if (!buyOrder) {
      interaction.reply({
        content: "This buy order does not exist or has been cancelled.",
        ephemeral: true,
      });
      return;
    }

    const itemInstance = playerInstance
      .getCraftingInventory()
      .getById(buyOrder.itemId);

    if (!itemInstance || itemInstance.amount < buyOrder.amount) {
      interaction.reply({
        content: `You do not have enough ${
          itemInstance?.getName() || "items"
        } to sell this order.`,
        ephemeral: true,
      });
      return;
    }

    // Check if player has enough money to create this buy order
    const buyer = await collectionManager
      .getCollection(CollectionId.PlayerInstances)
      .get(buyOrder.owner);

    if (!buyer) {
      interaction.reply({
        content: "The buyer of this order does not exist.",
        ephemeral: true,
      });

      return;
    }

    if (buyer._id.equals(playerInstance._id)) {
      interaction.reply({
        content: "You cannot sell an order to yourself.",
        ephemeral: true,
      });
      return;
    }

    restoreFieldsAndMethods(buyer, new PlayerInstance());

    const moneyName = getFromOptionalFunc(
      items["money"].getName,
      new ItemInstance("money", 1)
    );

    const balance = buyer.getCraftingInventory().getCountById("money");

    if (balance < buyOrder.price) {
      interaction.reply({
        content: `The buyer (<@${buyOrder.ownerDiscordId}>) does not have enough ${moneyName} to buy this order.`,
        ephemeral: true,
      });
      return;
    }

    // Transfer the item from the seller to the buyer
    playerInstance
      .getCraftingInventory()
      .removeById(buyOrder.itemId, buyOrder.amount);
    buyer
      .getCraftingInventory()
      .add(new ItemInstance(buyOrder.itemId, buyOrder.amount));

    // Transfer the money from the buyer to the seller
    playerInstance
      .getCraftingInventory()
      .add(new ItemInstance("money", buyOrder.price));
    buyer.getCraftingInventory().removeById("money", buyOrder.price);

    const promises: Promise<any>[] = [];

    // Remove the buy order
    promises.push(
      collectionManager.getCollection(CollectionId.BuyOrders).delete(orderId)
    );

    buyer.buyOrders = buyer.buyOrders.filter((order) => !order.equals(orderId));

    // Save the updated player instances
    promises.push(
      collectionManager
        .getCollection(CollectionId.PlayerInstances)
        .upsert(playerInstance)
    );
    promises.push(
      collectionManager
        .getCollection(CollectionId.PlayerInstances)
        .upsert(buyer)
    );

    await Promise.all(promises);

    interaction.reply({
      content: `<@${interaction.user.id}> has fulfilled <@${buyOrder.ownerDiscordId}>'s buy order!`,
    });
  },
  cancelOrder: async (interaction, data) => {
    const orderId = new ObjectId(data);
    const collectionManager = getCollectionManager(await getMongoClient());

    const playerInstance = await requirePrimarySave(interaction);
    if (!playerInstance) return;

    const buyOrder = await collectionManager
      .getCollection(CollectionId.BuyOrders)
      .get(orderId);

    if (!buyOrder) {
      interaction.reply({
        content: "This buy order does not exist or has been cancelled.",
        ephemeral: true,
      });
      return;
    }

    if (!buyOrder.owner.equals(playerInstance._id)) {
      interaction.reply({
        content: "You do not own this buy order.",
        ephemeral: true,
      });
      return;
    }

    // Remove the buy order
    await collectionManager
      .getCollection(CollectionId.BuyOrders)
      .delete(orderId);

    playerInstance.buyOrders = playerInstance.buyOrders.filter(
      (order) => !order.equals(orderId)
    );

    await collectionManager
      .getCollection(CollectionId.PlayerInstances)
      .upsert(playerInstance);

    interaction.reply({
      content: `<@${
        buyOrder.ownerDiscordId
      }> has canceled their buy order for ${buyOrder.itemId} x${
        buyOrder.amount
      } at ${buyOrder.price} ${getFromOptionalFunc(
        items["money"].getName,
        new ItemInstance("money", 1)
      )}.`,
    });
  },
};

export default function handleButtonInteraction(
  interaction: ButtonInteraction
) {
  const splitId = interaction.customId.split("-");
  const buttonId = splitId[0];
  const data = splitId.slice(1).join("-");

  const buttonHandler = buttons[buttonId];
  if (buttonHandler) {
    buttonHandler(interaction, data);
    return;
  }

  console.warn(`No handler found for button interaction: ${buttonId}`);
  interaction.reply({
    content: "This button does not have a valid action associated with it.",
    ephemeral: true,
  });
}
