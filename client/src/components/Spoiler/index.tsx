import Label from "components/Label";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";
import { ReactComponent } from "icons/arrowDown.svg";
import Header from "components/Header";
import Button, { ButtonProps } from "components/Button";

export type SpoilerProps = OverrideProps<
  React.HTMLAttributes<HTMLDivElement>,
  {
    label: string;
    opened?: boolean;
    onToggle?: (open?: boolean) => void;
  }
>;

const Spoiler: React.FC<SpoilerProps> = (props) => {
  const { label, children, opened, onToggle, ...rest } = props;

  const [isOpened, toggleOpen] = React.useState(() => opened);

  const mergedProps = mergeProps(
    {
      className: mergeClassNames(
        `spoiler`,
        (onToggle ? opened : isOpened) && "spoiler_opened"
      ),
    },
    rest
  );

  const handleToggleOpen = () => {
    if (onToggle) onToggle(!opened);
    else toggleOpen(!isOpened);
  };

  return (
    <div {...mergedProps}>
      <Button tabIndex={0} onClick={handleToggleOpen} color="invisible" className="spoiler__button">
        <Header className="spoiler__label">{label}</Header>
      </Button>
      <div className="spoiler__container">{children}</div>
    </div>
  );
};

export default Spoiler;
