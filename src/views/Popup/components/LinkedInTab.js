import {
  Avatar,
  Badge,
  CircularProgress,
  Fab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { Person, RefreshOutlined, UpdateOutlined } from "@material-ui/icons";
import React from "react";
import Alert from "@material-ui/lab/Alert";

const LinkedInTab = (props) => {
  const {
    isLoading,
    isUpdating,
    isLinkedInTab,
    usersProfile,
    unsavedUsersProfile,
    handleOnClickUpdate,
    handleOnClickRefresh,
  } = props;

  /* console.log(
    isLoading,
    isUpdating,
    isLinkedInTab,
    usersProfile,
    savedUsersProfile,
    unsavedUsersProfile,
    storageData,
    bottomNavigationValue,
    handleOnClickUpdate,
    handleOnClickRefresh
  ); */

  const populateUsers = (profiles) => (
    <List component="ul">
      {console.log(profiles)}
      {profiles &&
        Object.values(profiles).map((user) => (
          <ListItem>
            <ListItemAvatar>
              {user.img && <Avatar src={user.img} />}
              {!user.img && (
                <Avatar>
                  <Person />
                </Avatar>
              )}
            </ListItemAvatar>
            <ListItemText
              primary={<b>{user.name}</b>}
              secondary={
                <span>
                  {user.email && (
                    <Typography
                      component="span"
                      variant="body2"
                      color="textPrimary"
                      display="inline"
                    >
                      {user.email.length ? user.email : "Email Not Found"}
                      <br />
                    </Typography>
                  )}
                  {user.occ}
                </span>
              }
              primaryTypographyProps={{
                style: {
                  fontSize: "15px",
                },
              }}
              secondaryTypographyProps={{
                style: {
                  fontSize: "12px",
                },
              }}
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
        <Tooltip title="Refresh" placement="left">
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
        </Tooltip>
      ) : (
        <Tooltip title="Refresh" placement="left">
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
        </Tooltip>
      )}
    </div>
  );

  const updateButton = (
    <div>
      {Object.keys(unsavedUsersProfile).length > 0 &&
        (isUpdating ? (
          <Tooltip title="Fetch email" placement="left">
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
          </Tooltip>
        ) : (
          <Tooltip title="Fetch email" placement="left">
            <Fab
              size="small"
              color="secondary"
              aria-label="update"
              onClick={() => handleOnClickUpdate(unsavedUsersProfile)}
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
          </Tooltip>
        ))}
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

  return (
    <div className="linkedin-tab">
      {isLinkedInTab && Object.keys(usersProfile).length > 0 ? (
        <div>
          <Alert severity="info">
            {Object.keys(usersProfile).length} profile found
          </Alert>
          <div className="users-profile">{populateUsers(usersProfile)}</div>
          <div className="refresh-button">{refreshButton}</div>
          <div className="update-button">{updateButton}</div>
        </div>
      ) : (
        <div className="users-profile">{noUsersProfile}</div>
      )}
    </div>
  );
};

export default LinkedInTab;
