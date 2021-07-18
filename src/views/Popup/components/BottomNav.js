import {
	AppBar,
	Avatar,
	Badge,
	BottomNavigation,
	BottomNavigationAction,
	Grid,
	Toolbar,
} from "@material-ui/core";
import { AccountBoxRounded, MailRounded, SettingsApplications } from "@material-ui/icons";

const BottomNav = (props) => {
	const { bottomNavigationValue, handleBottomNavigationValue, usersProfile, storageData } = props;

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
			<AppBar position="fixed" style={{ height: "auto" }} color="">
				<Grid justify={"space-between"} container>
					<Grid xs item>
						<img
							src="logo.png"
							width="180px"
							height="50px"
							style={{ marginTop: "5px", marginLeft: "10px" }}
						/>
					</Grid>
					<Grid xs item>
						<BottomNavigation
							value={bottomNavigationValue}
							onChange={handleBottomNavigationValue}
							showLabels
						>
							<BottomNavigationAction label="Profiles" icon={<AccountBoxRounded />} />
							<BottomNavigationAction label="Saved" icon={<MailRounded />} />
							<BottomNavigationAction
								label="Setting"
								icon={<SettingsApplications />}
							/>
						</BottomNavigation>
					</Grid>
					<Grid xs item>
						{null}
					</Grid>
				</Grid>
			</AppBar>
			<Toolbar />
		</div>
	);
};

export default BottomNav;
