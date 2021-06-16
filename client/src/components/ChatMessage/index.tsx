import Link from "components/Link";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";
import Header from "components/Header";

export type ChatMessageProps = OverrideProps<
  React.HTMLAttributes<HTMLDivElement>,
  {
    message: string;
    time?: string;
    author?: string;
  }
>;

const ChatMessage: React.FC<ChatMessageProps> = (props) => {
  const { author, time, message, children, ...rest } = props;

  const childrenCount = React.Children.count(children);

  const mergedProps = mergeProps(
    {
      className: mergeClassNames(
        "chat-message",
        childrenCount > 0 && `chat-message_actions`
      ),
    },
    rest
  );

  return (
    <div {...mergedProps}>
      <div className="chat-message__content">
        {message}
        <Header className="chat-message__info">
          {author && (
            <Link className="chat-message__author" isMonospace>
              {author}
            </Link>
          )}
          {time}
        </Header>
      </div>
      {children}
    </div>
  );
};

export default ChatMessage;
