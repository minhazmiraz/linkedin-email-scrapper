import {
  Avatar,
  Card,
  CardHeader,
  Container,
  List,
  ListItem,
} from "@material-ui/core";

const Body = (props) => {
  const { isAuth, usersProfile, handleAuthentication } = props;
  const centerStyle = {
    position: "absolute",
    margin: "auto",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };
  const notAuthenticated = (
    <div>
      <img
        src="sign-in-linkedin.png"
        style={{ ...centerStyle }}
        width="50%"
        alt="sign in with linkedin"
        onClick={() => handleAuthentication()}
      />
    </div>
  );
  const noUser = (
    <div>
      <img
        src="logo192.png"
        style={{ ...centerStyle, opacity: 0.05 }}
        width="50%"
        height="50%"
        alt=""
      />
      <p
        style={{
          padding: "",
          fontFamily: "Georgia",
          fontSize: "18px",
          color: "#bdb9b9",
          textAlign: "center",
          display: "flex",
          "justify-content": "center",
          "flex-direction": "column",
          height: "450px",
        }}
      >
        <i>
          Goto linkedin connection or search page and click the refresh button
        </i>
      </p>
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
    <div className="body">
      <Container>
        {!isAuth && notAuthenticated}
        {isAuth && Object.entries(usersProfile).length === 0 && noUser}
        {isAuth && Object.entries(usersProfile).length > 0 && populateUsers}
      </Container>
    </div>
  );
};

export default Body;
