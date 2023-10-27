import { PropsWithChildren, useState } from "react";
import styles from "@/styles/navbar.module.css";
import { PrimaryButton } from "./button";
import { type NextRouter, useRouter } from "next/router";
import HomeIcon from "@mui/icons-material/Home";
import ExploreIcon from "@mui/icons-material/Explore";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import CreateIcon from "@mui/icons-material/Create";
import {
  Button,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CreatePost from "./create-post";
import Link from "next/link";

export const NavBar = () => {
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <NavRegular
        router={router}
        postDialogOpen={postDialogOpen}
        setPostDialogOpen={setPostDialogOpen}
      />
      <NavSmall
        router={router}
        postDialogOpen={postDialogOpen}
        setPostDialogOpen={setPostDialogOpen}
      />
    </>
  );
};

interface NavBarProps {
  setPostDialogOpen: (open: boolean) => void;
  postDialogOpen: boolean;
  router: NextRouter;
}

function NavRegular(props: NavBarProps) {
  return (
    <header className={styles.navbar_reg}>
      <nav style={{ display: "flex", flexDirection: "column", padding: "0 .8rem" }}>
        <div
          className="rms_logo"
          style={{ margin: "0 auto" }}
          onClick={() => props.router.push("/")}
        />
        <List>
          <NavItem icon={<HomeIcon />} link="/">
            Home
          </NavItem>
          {/* <NavItem icon={<ExploreIcon />} link="/explore"> */}
          {/*   Explore */}
          {/* </NavItem> */}
          {/* <NavItem icon={<NotificationsIcon />} link="/notifications"> */}
          {/*   Notifications */}
          {/* </NavItem> */}
          <NavItem icon={<PersonIcon />} link="/profile">
            Profile
          </NavItem>
        </List>
        <div>
          <PrimaryButton
            sx={{ width: "100%", py: 1.5 }}
            onClick={() => props.setPostDialogOpen(true)}
          >
            POST
          </PrimaryButton>
        </div>
      </nav>
      {props.postDialogOpen && (
        <CreatePost open={props.postDialogOpen} close={() => props.setPostDialogOpen(false)} />
      )}
    </header>
  );
}

function NavSmall(props: NavBarProps) {
  return (
    <header className={styles.navbar_sm}>
      <nav className={styles.navbar_sm_nav}>
        <div className="rms_logo" onClick={() => props.router.push("/")} />
        <List
          sx={{
            display: "flex",
            flexDirection: "inherit",
            justifyContent: "center",
            px: 0,
          }}
        >
          <NavItemSm link="/">
            <HomeIcon />
          </NavItemSm>
          {/* <NavItemSm link="/explore"> */}
          {/*   <ExploreIcon /> */}
          {/* </NavItemSm> */}
          {/* <NavItemSm link="/notifications"> */}
          {/*   <NotificationsIcon /> */}
          {/* </NavItemSm> */}
          <NavItemSm link="/profile">
            <PersonIcon />
          </NavItemSm>
        </List>
        <div style={{ display: "grid", placeItems: "center" }}>
          <Button
            variant="contained"
            sx={{
              p: 0.5,
              aspectRatio: 1,
              width: "fit-content",
              minWidth: "fit-content",
              borderRadius: "50%",
            }}
            onClick={() => props.setPostDialogOpen(true)}
          >
            <CreateIcon />
          </Button>
        </div>
      </nav>
      {props.postDialogOpen && (
        <CreatePost open={props.postDialogOpen} close={() => props.setPostDialogOpen(false)} />
      )}
    </header>
  );
}

function NavItem(
  props: {
    icon: JSX.Element;
    link: string;
  } & PropsWithChildren
) {
  return (
    <Link href={props.link} style={{ color: "inherit", textDecoration: "none" }}>
      <ListItemButton sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <ListItemAvatar sx={{ minWidth: "fit-content" }}>{props.icon}</ListItemAvatar>
        <ListItemText primaryTypographyProps={{ fontSize: "1.25rem" }}>
          {props.children}
        </ListItemText>
      </ListItemButton>
    </Link>
  );
}

function NavItemSm(
  props: {
    link: string;
  } & PropsWithChildren
) {
  return (
    <Link href={props.link}>
      <ListItemButton sx={{ width: "fit-content", mx: "auto" }}>
        <ListItemIcon sx={{ minWidth: "fit-content" }}>{props.children}</ListItemIcon>
      </ListItemButton>
    </Link>
  );
}
