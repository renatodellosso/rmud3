import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalSubmitInteraction,
} from "discord.js";
import { discordIdToPlayerInstance } from "lib/auth";
import getCollectionManager from "lib/getCollectionManager";
import { getMongoClient } from "lib/getMongoClient";
import { itemNameToId } from "lib/itemsutils";
import { BuyOrder } from "lib/types/types";
import { ObjectId } from "bson";
import CollectionId from "lib/types/CollectionId";
import { getFromOptionalFunc, restoreFieldsAndMethods } from "lib/utils";
import items from "lib/gamedata/items";
import { ItemInstance } from "lib/types/item";
import { PlayerInstance } from "lib/types/entities/player";

const modals: Record<
  string,
  (interaction: ModalSubmitInteraction) => Promise<void>
> = {
  buyOrderModal: async (interaction) => {
    const itemName = interaction.fields.getTextInputValue("itemName");
    const amount = interaction.fields.getTextInputValue("amount");
    const price = interaction.fields.getTextInputValue("price");

    if (!itemName || !amount || !price) {
      interaction.reply({
        content: "Please fill in all fields.",
        ephemeral: true,
      });
      return;
    }

    // Check that amount and price are valid, positive numbers
    const amountNum = parseInt(amount);
    const priceNum = parseFloat(price);
    if (isNaN(amountNum) || isNaN(priceNum) || amountNum <= 0 || priceNum < 0) {
      interaction.reply({
        content: "Amount and price must be positive numbers.",
        ephemeral: true,
      });
      return;
    }

    const itemId = itemNameToId(itemName);

    if (!itemId) {
      interaction.reply({
        content: "Invalid item name.",
        ephemeral: true,
      });
      return;
    }

    // Create buy order

    const collectionManager = getCollectionManager(await getMongoClient());

    const playerInstance = await discordIdToPlayerInstance(
      collectionManager,
      interaction.user.id
    );

    if (!playerInstance) {
      interaction.reply({
        content: "Invalid player instance.",
        ephemeral: true,
      });
      return;
    }

    restoreFieldsAndMethods(playerInstance, new PlayerInstance());

    const moneyName = getFromOptionalFunc(
      items["money"].getName,
      new ItemInstance("money", 1)
    );

    const balance = playerInstance.getCraftingInventory().getCountById("money");
    if (balance < priceNum) {
      interaction.reply({
        content: `You do not have enough money to create this buy order. 
        You need at least x${priceNum} ${moneyName}, but only have x${balance} ${moneyName}.`,
        ephemeral: true,
      });
      return;
    }

    const buyOrder: BuyOrder = {
      _id: new ObjectId(),
      owner: playerInstance._id,
      ownerDiscordId: interaction.user.id,
      itemId: itemId,
      amount: amountNum,
      price: priceNum,
    };

    await collectionManager
      .getCollection(CollectionId.BuyOrders)
      .upsert(buyOrder);

    playerInstance.buyOrders = playerInstance.buyOrders || [];
    playerInstance.buyOrders.push(buyOrder._id);

    await collectionManager
      .getCollection(CollectionId.PlayerInstances)
      .upsert(playerInstance);

    const sellButton = new ButtonBuilder()
      .setCustomId(`sellOrder-${buyOrder._id.toString()}`)
      .setLabel(
        `Sell ${itemName} x${amountNum} to ${interaction.user.displayName} for x${priceNum} ${moneyName}`
      )
      .setStyle(ButtonStyle.Primary);

    const cancelButton = new ButtonBuilder()
      .setCustomId(`cancelOrder-${buyOrder._id.toString()}`)
      .setLabel("Cancel Order")
      .setStyle(ButtonStyle.Danger);

    interaction.reply({
      content: `<@${interaction.user.id}> created a buy order for ${itemName} x${amountNum} at x${priceNum} ${moneyName}!`,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          sellButton,
          cancelButton
        ),
      ],
    });
  },
};

export default function handleModalSubmit(interaction: ModalSubmitInteraction) {
  const modalHandler = modals[interaction.customId];

  if (modalHandler) {
    modalHandler(interaction);
    return;
  }

  console.error(`No handler found for modal: ${interaction.customId}`);
}
