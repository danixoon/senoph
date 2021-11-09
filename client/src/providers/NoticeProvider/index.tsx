import * as React from "react";
import PopupLayout from "layout/PopupLayout";
import { useAppDispatch, useAppSelector } from "store";
import PopupLayer from "../PopupLayer";
import Notice from "components/Notice";
import { createNotice, removeNotice } from "store/slices/notice";
import Layout from "components/Layout";
import "./style.styl";
import { AnimatePresence, motion } from "framer-motion";

// export const NoticeLayerContext = React.createContext<HTMLElement | null>(null);

export interface NoticeLayerProviderProps {}

export type NoticeContextState = {
  createNotice: (message: string, type?: "danger" | "info") => void;
};
export const NoticeContext = React.createContext<NoticeContextState>({
  createNotice: () => {},
});

const NoticeLayerProvider: React.FC<
  React.PropsWithChildren<NoticeLayerProviderProps>
> = ({ children }) => {
  const notices = useAppSelector((state) => state.notice.notices);
  const dispatch = useAppDispatch();

  const handleCreateNotice = (
    message: string,
    type: "danger" | "info" = "info"
  ) => {
    // TODO: Change to uuid
    const id = Math.random(); // randomUUID();
    const lifeTime = 3000;
    dispatch(createNotice({ id, message, type, lifeTime }));
    setTimeout(() => {
      dispatch(removeNotice({ id }));
    }, lifeTime);
  };

  return (
    <NoticeContext.Provider
      value={{
        createNotice: handleCreateNotice,
      }}
    >
      {children}
      <PopupLayer>
        <Layout className="notice-container" flow="column-reverse">
          <AnimatePresence initial={false}>
            {notices.map(({ lifeTime, message, createTime, ...rest }) => (
              <motion.div
                key={rest.id}
                //@ts-ignore
                positionTransition
                initial={{ opacity: 0, y: 50, scale: 0.3 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              >
                <Notice>{message}</Notice>
              </motion.div>
            ))}
          </AnimatePresence>
        </Layout>
      </PopupLayer>
    </NoticeContext.Provider>
  );
};

export default NoticeLayerProvider;