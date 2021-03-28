import {
  Avatar,
  Badge,
  Button,
  CircularProgress,
  Fab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
  Typography,
} from "@material-ui/core";
import {
  Cancel,
  CheckCircle,
  GetAppRounded,
  Person,
  VerifiedUserOutlined,
} from "@material-ui/icons";
import React from "react";
import { exportAsCSV } from "../common/utils";
import Alert from "@material-ui/lab/Alert";

const SavedProfilesTab = (props) => {
  const {
    storageData,
    apiToken,
    handleOnClickVerify,
    handleApiTokenPopupOpen,
    apiTokenPopup,
  } = props;

  const handleExportProfileData = () => {
    let replaceChar = (match) => (match === "," ? " | " : " ");

    let csvContent = "NAME,EMAIL,OCCUPATION,LINK,\n";
    csvContent += Object.entries(storageData)
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

  const populateUsers = (profiles) => (
    <List component="ul">
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
                  {user.email !== undefined && (
                    <Typography
                      component="div"
                      variant="body2"
                      color="textPrimary"
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
                  whiteSpace: "nowrap",
                  width: "250px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
              secondaryTypographyProps={{
                style: {
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  width: "250px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
            {!user.is_email_verifying && (
              <ListItemIcon>
                {user.email_verified === true && (
                  <CheckCircle
                    style={{
                      fill: "green",
                      marginRight: "40px",
                    }}
                  />
                )}
                {user.email_verified === false && (
                  <Cancel
                    style={{
                      fill: "red",
                      marginRight: "40px",
                    }}
                  />
                )}
              </ListItemIcon>
            )}

            {!user.is_email_verifying && (
              <ListItemSecondaryAction>
                <Button
                  color="primary"
                  style={{
                    maxWidth: "50px",
                    maxHeight: "30px",
                    fontSize: "10px",
                  }}
                  variant="contained"
                  onClick={
                    apiToken
                      ? () => handleOnClickVerify(user)
                      : () => handleApiTokenPopupOpen()
                  }
                >
                  Verify
                </Button>
              </ListItemSecondaryAction>
            )}
            {user.is_email_verifying && <CircularProgress size={20} />}
          </ListItem>
        ))}
    </List>
  );

  const verifyButton = (
    <div>
      {
        <Tooltip title="Verify All Email" placement="left">
          <Fab
            size="small"
            color="secondary"
            aria-label="update"
            onClick={() => handleOnClickVerify(storageData)}
            style={{
              position: "fixed",
              bottom: 110,
              right: 8,
              top: "auto",
              left: "auto",
            }}
          >
            {getBadgeWithValue(
              storageData,
              "primary",
              <VerifiedUserOutlined />
            )}
          </Fab>
        </Tooltip>
      }
    </div>
  );

  const exportButton = (
    <div>
      <Tooltip title="Export as CSV" placement="left">
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
      </Tooltip>
    </div>
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

  return (
    <div className="saved-profiles-tab">
      {storageData && Object.keys(storageData).length > 0 ? (
        <div>
          <Alert severity="info">
            {Object.keys(storageData).length} saved profile
          </Alert>
          <div className="users-profile">{populateUsers(storageData)}</div>
          <div className="export-button">{exportButton}</div>
        </div>
      ) : (
        <div className="users-profile">{noStorageData}</div>
      )}
      {apiTokenPopup()}
    </div>
  );
};

export default SavedProfilesTab;
