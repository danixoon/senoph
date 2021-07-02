import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import { ReactComponent } from "icons/toggle.svg";
import "./styles.styl";
import Label from "components/Label";
import Button from "components/Button";

type SwitchItem = {
  id: any;
  name: string;
};

type SwitchProps = OverrideProps<
  React.HTMLAttributes<HTMLUListElement>,
  {
    position?: "horizontal" | "vertical";
    input: any;
    name: string;
    border?: boolean;
    size?: Size;
    items: SwitchItem[];
    onChange: HookOnChange;
  }
>;

const Switch: React.FC<SwitchProps> = (props) => {
  const {
    input,
    items,
    name,
    position = "horizontal",
    border,
    size = "md",
    onChange,
    ...rest
  } = props;

  const mergedProps = mergeProps(
    {
      className: mergeClassNames(
        `switch`,
        `switch_${position}`,
        `switch_${size}`,
        border && `switch_border`
      ),
    },
    rest
  );

  const handleItemSelect = (item: SwitchItem) => {
    onChange({ target: { name, value: item.id } });
  };

  const selectedId = input[name];

  return (
    <ul {...mergedProps}>
      {items.map((item) => (
        <li key={item.id}>
          <Button
            size={size}
            inverted
            fill
            onClick={() => handleItemSelect(item)}
            className={mergeClassNames(
              "switch__item",
              item.id === selectedId && "switch__item_selected"
            )}
          >
            <Label size={size} className="switch__label">
              {item.name}
            </Label>
          </Button>
          {/* <hr className="switch__icon" /> */}
        </li>
      ))}
    </ul>
  );
};

export default Switch;
