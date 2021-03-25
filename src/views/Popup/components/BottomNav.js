import {
  AppBar,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Toolbar,
} from "@material-ui/core";
import { AccountBoxRounded, HomeRounded } from "@material-ui/icons";

const BottomNav = (props) => {
  const {
    bottomNavigationValue,
    handleBottomNavigationValue,
    usersProfile,
    storageData,
  } = props;

  const getBadgeWithValue = (data, icon) => {
    let len = 0;
    if (data) len = Object.keys(data).length;
    if (len > 0) {
      return (
        <Badge badgeContent={len} color="secondary">
          {icon}
        </Badge>
      );
    } else {
      return icon;
    }
  };

  return (
    <div className="bottom-nav">
      <AppBar position="fixed" color="default" style={{ height: "auto" }}>
        <BottomNavigation
          value={bottomNavigationValue}
          onChange={handleBottomNavigationValue}
          showLabels
        >
          <BottomNavigationAction label="Home" icon={<HomeRounded />} />
          <BottomNavigationAction label="Saved" icon={<AccountBoxRounded />} />
        </BottomNavigation>
      </AppBar>
      <Toolbar />
    </div>
  );
};

export default BottomNav;
