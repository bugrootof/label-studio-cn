import { cn } from "../../utils/bem";
import { useTranslation } from "@humansignal/core";
import { Menu } from "../Menu/Menu";
import "./SidebarMenu.prefix.css";

export const SidebarMenu = ({ children, menu, path, menuItems }) => {
  const rootClass = cn("sidebar-menu");
  const { t } = useTranslation();

  return (
    <div className={rootClass}>
      {menuItems && menuItems.length > 1 ? (
        <div className={rootClass.elem("navigation").toClassName()}>
          <Menu>{menuItems ? Menu.Builder(path, menuItems, t) : menu}</Menu>
        </div>
      ) : null}
      <div className={rootClass.elem("content").toClassName()}>{children}</div>
    </div>
  );
};
