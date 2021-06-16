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
    input: any;
    name: string;
    items: SwitchItem[];
    onChange: HookOnChange;
  }
>;

const Switch: React.FC<SwitchProps> = (props) => {
  const { input, items, name, onChange, ...rest } = props;

  const mergedProps = mergeProps(
    { className: mergeClassNames(`switch`) },
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
            color="invisible"
            onClick={() => handleItemSelect(item)}
            className={mergeClassNames(
              "switch__item",
              item.id === selectedId && "switch__item_selected"
            )}
          >
            <Label size="md" className="switch__label">
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
