"use client";

import Link from "next/link";
import { Button, IconButton } from "@mui/material";
import UserInfo from "./userInfo";
import { logoutAction } from "../lib/actions";
import { UserLite } from "../lib/types";
import Dehaze from "@mui/icons-material/Dehaze";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import { useState } from "react";
import CheckBoxOutlined from "@mui/icons-material/CheckBoxOutlined";
import { usePathname } from "next/navigation";
import Add from "@mui/icons-material/Add";

export default function HeaderClient({ user }: { user: UserLite | null }) {
  const isLoggedIn = !!user;

  const pathname = usePathname();

  // アクティブ判定ヘルパー
  const isActive = (href: string) => pathname === href;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <header className="fixed z-10 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-20">
          <Button
            component={Link}
            href="/todos"
            aria-label="todos"
            title="todos"
          >
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              TODO Today
            </span>
          </Button>
          {isLoggedIn && (
            <div className="hidden  md:flex space-x-6">
              <Link
                href="/todos"
                aria-label="todos"
                title="todos"
                className={
                  pathname === "/todos"
                    ? "text-blue-500 font-bold border-b-blue-400 border-b-2"
                    : "text-gray-700"
                }
              >
                TODO一覧
              </Link>
              <Link
                href="/todos/new"
                aria-label="todosNew"
                title="todosNew"
                className={
                  pathname === "/todos/new"
                    ? "text-blue-500 font-bold border-b-blue-400 border-b-2"
                    : "text-gray-700"
                }
              >
                TODOを追加
              </Link>
            </div>
          )}
        </div>

        {isLoggedIn && (
          <>
            <div className="items-center gap-3 hidden md:flex">
              <UserInfo user={user} />

              <form action={logoutAction}>
                <Button type="submit" variant="outlined">
                  <span className="whitespace-nowrap">Log out</span>
                </Button>
              </form>
            </div>

            <div className="block md:hidden">
              <IconButton onClick={handleClick}>
                <Dehaze></Dehaze>
              </IconButton>
            </div>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&::before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Link href="/todos" onClick={handleClose}>
                <MenuItem>
                  <ListItemIcon>
                    <CheckBoxOutlined fontSize="small"></CheckBoxOutlined>
                  </ListItemIcon>
                  TODO一覧
                </MenuItem>
              </Link>
              <Link href="/todos/new" onClick={handleClose}>
                <MenuItem>
                  <ListItemIcon>
                    <Add fontSize="small"></Add>
                  </ListItemIcon>
                  TODOを追加
                </MenuItem>
              </Link>
              <Divider />

              <Link href="/mypage" onClick={handleClose}>
                <MenuItem onClick={handleClose}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  ユーザー設定
                </MenuItem>
              </Link>
              <MenuItem
                onClick={() => {
                  handleClose();
                  logoutAction();
                }}
              >
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                ログアウト
              </MenuItem>
            </Menu>
          </>
        )}
      </div>
    </header>
  );
}
