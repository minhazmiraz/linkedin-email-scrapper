import {
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from "@material-ui/core";
import { Settings } from "@material-ui/icons";

const SettingTab = (props) => {
  const { handleApiTokenPopupOpen, apiTokenPopup } = props;
  return (
    <div className="setting-tab">
      <List component="ul">
        <ListItem>
          <ListItemText
            primary="Change Api Key"
            primaryTypographyProps={{
              style: {
                fontSize: "15px",
              },
            }}
          />
          <ListItemSecondaryAction>
            <IconButton
              aria-label="change api token"
              color="inherit"
              size="small"
              onClick={() => handleApiTokenPopupOpen()}
            >
              <Settings />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
      {apiTokenPopup()}
    </div>
  );
};

export default SettingTab;
