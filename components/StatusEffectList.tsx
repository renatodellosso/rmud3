import statusEffects from "lib/gamedata/statusEffects";
import { StatusEffectInstance } from "lib/types/statuseffect";
import { useEffect, useState } from "react";

export default function StatusEffectList({
  effects,
}: {
  effects: StatusEffectInstance[];
}) {
  const [render, setRender] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRender((prev) => prev + 1);
    }, 100);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <strong>Status Effects</strong>
      <ul>
        {effects.map((effect) => (
          <li key={effect.definitionId} className="tooltip">
            {statusEffects[effect.definitionId].name}{" "}
            {effect.strength.toFixed()} (expires in{" "}
            {((effect.expiresAt.getTime() - Date.now()) / 1000).toFixed(1)}s)
            <div className="tooltip-text w-32">
              {statusEffects[effect.definitionId].description}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
