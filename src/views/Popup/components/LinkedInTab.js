import {
  AppBar,
  Avatar,
  Badge,
  CircularProgress,
  Fab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core";
import {
  GetAppRounded,
  RefreshOutlined,
  UpdateOutlined,
} from "@material-ui/icons";
import React, { useEffect } from "react";
import { exportAsCSV } from "../common/utils";

const LinkedInTab = (props) => {
  const {
    isLoading,
    isUpdating,
    isLinkedInTab,
    usersProfile,
    savedUsersProfile,
    unsavedUsersProfile,
    storageData,
    bottomNavigationValue,
    handleOnClickUpdate,
    handleOnClickRefresh,
  } = props;

  const handleExportProfileData = () => {
    let replaceChar = (match) => (match === "," ? " | " : " ");

    let csvContent = "NAME,EMAIL,OCCUPATION,LINK,\n";
    csvContent += Object.entries(storageData.users_profile)
      .map(
        (profile) =>
          profile[1].name.replace(/[,\n]/g, replaceChar) +
          "," +
          profile[1].email +
          "," +
          profile[1].occ.replace(/[,\n]/g, replaceChar) +
          "," +
          "https://www.linkedin.com/in/" +
          profile[0].replace(/[,\n]/g, replaceChar) +
          ","
      )
      .join("\n");

    console.log(csvContent);
    exportAsCSV(csvContent);
  };

  const populateUsers = (profiles) => (
    <List component="ul">
      {usersProfile &&
        Object.values(profiles).map((user) => (
          <ListItem>
            <ListItemAvatar>
              <Avatar src={user.img} />
            </ListItemAvatar>
            <ListItemText
              primary={<b>{user.name}</b>}
              secondary={
                <span>
                  {user.email !== undefined && (
                    <Typography
                      component="span"
                      variant="body2"
                      color="textPrimary"
                      display="inline"
                    >
                      {(user.email ? user.email : "Email Not Found") + " - "}
                    </Typography>
                  )}
                  {user.occ}
                </span>
              }
            />
          </ListItem>
        ))}
    </List>
  );

  const getBadgeWithValue = (data, color, icon) => {
    let len = 0;
    if (data) len = Object.keys(data).length;
    console.log(len);
    if (len > 0) {
      return (
        <Badge badgeContent={len} color={color}>
          {icon}
        </Badge>
      );
    } else {
      return icon;
    }
  };

  const refreshButton = (
    <div>
      {Object.keys(usersProfile).length > 0 && isLoading ? (
        <Fab
          size="small"
          aria-label="refresh"
          disabled
          style={{
            position: "fixed",
            bottom: 58,
            right: 8,
            top: "auto",
            left: "auto",
          }}
        >
          {getBadgeWithValue(
            usersProfile,
            "secondary",
            <CircularProgress size={30} />
          )}
        </Fab>
      ) : (
        <Fab
          size="small"
          color="primary"
          aria-label="refresh"
          onClick={handleOnClickRefresh}
          style={{
            position: "fixed",
            bottom: 58,
            right: 8,
            top: "auto",
            left: "auto",
          }}
        >
          {getBadgeWithValue(usersProfile, "secondary", <RefreshOutlined />)}
        </Fab>
      )}
    </div>
  );

  const updateButton = (
    <div>
      {Object.keys(unsavedUsersProfile).length > 0 &&
        (isUpdating ? (
          <Fab
            size="small"
            aria-label="update"
            disabled
            style={{
              position: "fixed",
              bottom: 110,
              right: 8,
              top: "auto",
              left: "auto",
            }}
          >
            {getBadgeWithValue(
              unsavedUsersProfile,
              "primary",
              <CircularProgress size={30} color="secondary" />
            )}
          </Fab>
        ) : (
          <Fab
            size="small"
            color="secondary"
            aria-label="update"
            onClick={handleOnClickUpdate}
            style={{
              position: "fixed",
              bottom: 110,
              right: 8,
              top: "auto",
              left: "auto",
            }}
          >
            {getBadgeWithValue(
              unsavedUsersProfile,
              "primary",
              <UpdateOutlined />
            )}
          </Fab>
        ))}
    </div>
  );

  const exportButton = (
    <div>
      {Object.keys(storageData).length > 0 && (
        <Fab
          size="small"
          aria-label="export"
          color="primary"
          onClick={handleExportProfileData}
          style={{
            position: "fixed",
            bottom: 58,
            right: 8,
            top: "auto",
            left: "auto",
          }}
        >
          <GetAppRounded />
        </Fab>
      )}
    </div>
  );

  const noUsersProfile = (
    <p
      style={{
        fontFamily: "Georgia",
        fontSize: "15px",
        color: "#1c81a6",
        textAlign: "center",
      }}
    >
      <i>
        Goto linkedin connection or search page and click the refresh button
      </i>
    </p>
  );

  const noStorageData = (
    <p
      style={{
        fontFamily: "Georgia",
        fontSize: "15px",
        color: "#1c81a6",
        textAlign: "center",
      }}
    >
      <i>No Saved Profile</i>
    </p>
  );

  const homeTab = (
    <React.Fragment>
      {isLinkedInTab && Object.keys(usersProfile).length > 0 ? (
        <div>
          <div className="users-profile">{populateUsers(usersProfile)}</div>
          <div className="refresh-button">{refreshButton}</div>
          <div className="update-button">{updateButton}</div>
        </div>
      ) : (
        <div className="users-profile">{noUsersProfile}</div>
      )}
    </React.Fragment>
  );

  const savedTab = (
    <React.Fragment>
      {storageData.users_profile &&
      Object.keys(storageData.users_profile).length > 0 ? (
        <div>
          <div className="users-profile">
            {populateUsers(storageData.users_profile)}
          </div>
          <div className="export-button">{exportButton}</div>
        </div>
      ) : (
        <div className="users-profile">{noStorageData}</div>
      )}
    </React.Fragment>
  );

  return (
    <div className="linkedin-tab">
      {bottomNavigationValue > 0 ? savedTab : homeTab}
    </div>
  );
};

export default LinkedInTab;
