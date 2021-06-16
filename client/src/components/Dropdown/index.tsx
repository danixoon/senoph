import Label from "components/Label";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";
import { ReactComponent } from "icons/arrowDown.svg";
import Button from "components/Button";

type DropdownItem = { id: any; label: string; payload: any };

type DropdownProps = OverrideProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  {
    input: any;
    name: string;
    label: string;
    items: DropdownItem[];
    onChange: (event: { target: { name: string; value: any } }) => void;
  }
>;

const Dropdown: React.FC<DropdownProps> = (props) => {
  const { label, name, items, input, onChange, disabled, ...rest } = props;

  const [isOpened, toggleOpen] = React.useState(() => false);

  let listItems = [...items];
  let selectedItem: ArrayElement<DropdownProps["items"]> = listItems.find(
    (item, i) => {
      if (item.id === input[name]) {
        listItems.splice(i, 1);
        return true;
      }
    }
  ) ?? {
    label: "Не выбрано",
    id: "0",
    payload: {},
  };

  const handleItemSelect = (item: DropdownItem) => {
    onChange({ target: { name: props.name, value: item.id } });
    toggleOpen(false);
  };

  const mergedProps = mergeProps(
    {
      className: mergeClassNames(
        `dropdown`,
        isOpened && "dropdown_opened",
        disabled && "dropdown_disabled"
      ),
    },
    rest
  );

  const dropdownRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <div {...mergedProps}>
      <Label weight="medium" className="drowpown__label">
        {label}
      </Label>
      <div
        ref={(r) => (dropdownRef.current = r)}
        className="dropdown__container"
        onFocus={(e) => {
          if (!disabled) toggleOpen(true);
        }}
        onBlur={(e) => {
          const currentTarget = e.currentTarget;
          setTimeout(() => {
            if (!currentTarget.contains(document.activeElement)) {
              toggleOpen(false);
            }
          }, 0);
        }}
      >
        <Button color="invisible" className="dropdown-item">
          <Label unselectable>{selectedItem.label}</Label>
        </Button>
        {listItems.map((item, i) => (
          <Button
            key={item.id}
            color="invisible"
            className="dropdown-item"
            onClick={() => handleItemSelect(item)}
          >
            <Label unselectable>{item.label}</Label>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Dropdown;
