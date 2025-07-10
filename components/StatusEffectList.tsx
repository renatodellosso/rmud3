import statusEffects from "lib/gamedata/statusEffects";
import { StatusEffectInstance } from "lib/types/statuseffect";
import { useEffect, useState } from "react";
import { getFromOptionalFunc } from "../lib/utils";

export default function StatusEffectList({
  effects,
}: {
  effects: StatusEffectInstance[];
}) {
  const [render, setRender] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRender((prev) => prev + 1);
    }, 25);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <strong>Status Effects</strong>
      <ul>
        {effects.map((effect, index) => (
          <li key={index} className="tooltip">
            {statusEffects[effect.definitionId].name}{" "}
            {effect.strength.toFixed()} (expires in{" "}
            {Math.max((effect.expiresAt.getTime() - Date.now()) / 1000, 0).toFixed(1)}s)
            <div className="tooltip-text w-48">
              {getFromOptionalFunc(
                statusEffects[effect.definitionId].getDescription,
                effect
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
