import {
  AppBar,
  Avatar,
  Card,
  CardHeader,
  Chip,
  List,
  ListItem,
  Toolbar,
} from "@material-ui/core";
import { RefreshOutlined, UpdateOutlined } from "@material-ui/icons";

const LinkedInTab = (props) => {
  const {
    isLoading,
    usersProfile,
    handleOnClickUpdate,
    handleOnClickRefresh,
  } = props;

  const navbar = (
    <div>
      <AppBar color="default" position="fixed">
        <Toolbar>
          <Chip
            size="small"
            avatar={<Avatar>{Object.entries(usersProfile).length}</Avatar>}
            label="profile found"
            color="primary"
            style={{ margin: ["0px", "2px", "0px", "5px"] }}
          />
          <Chip
            size="small"
            avatar={
              <Avatar>
                {Object.values(usersProfile).reduce(
                  (r, o) => (r += !o["email"]),
                  0
                )}
              </Avatar>
            }
            label="profile not updated"
            color="secondary"
            onDelete={handleOnClickUpdate}
            deleteIcon={<UpdateOutlined />}
            style={{ margin: ["0px", "2px", "0px", "2px"] }}
          />
          <Chip
            size="small"
            label={isLoading ? "Refreshing..." : "Refresh"}
            color="primary"
            onClick={handleOnClickRefresh}
            onDelete={handleOnClickRefresh}
            deleteIcon={<RefreshOutlined />}
            style={{ margin: ["0px", "5px", "0px", "2px"] }}
            disabled={isLoading ? "true" : "false"}
          />
        </Toolbar>
      </AppBar>
      <Toolbar />
    </div>
  );

  const populateUsers = (
    <List component="ul">
      {usersProfile &&
        Object.values(usersProfile).map((user) => (
          <ListItem>
            <Card raised="true" style={{ width: "100%" }}>
              <CardHeader
                avatar={<Avatar src={user.img} />}
                title={<b> {user.name} </b>}
                subheader={user.occ}
              />
            </Card>
          </ListItem>
        ))}
    </List>
  );

  return (
    Object.entries(usersProfile).length > 0 && (
      <div className="linkedin-tab">
        <div className="navbar">{navbar}</div>
        <div className="usersprofile">{populateUsers}</div>
      </div>
    )
  );
};

export default LinkedInTab;
