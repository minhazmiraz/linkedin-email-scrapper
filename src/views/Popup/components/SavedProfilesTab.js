import {
	Avatar,
	Button,
	Fab,
	List,
	ListItem,
	ListItemAvatar,
	ListItemSecondaryAction,
	ListItemText,
	Tooltip,
	Typography,
} from "@material-ui/core";
import { GetAppRounded, Person } from "@material-ui/icons";
import React from "react";
import { exportAsCSV } from "../common/utils";
import Alert from "@material-ui/lab/Alert";

const SavedProfilesTab = (props) => {
	const { storageData, isEmailsUpdating, handleOnClickUpdateSavedEmail } = props;

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

	const populateUsers = (profiles) => (
		<List component="ul">
			{profiles &&
				Object.entries(profiles).map((profile) => {
					let userId = profile[0];
					let user = profile[1];
					return (
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
										{
											<Typography
												component="div"
												variant="body2"
												color="textPrimary"
											>
												{user.email?.length ? (
													user.email
												) : (
													<span style={{ color: "red" }}>
														Private email
													</span>
												)}
												<br />
											</Typography>
										}
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
							{!isEmailsUpdating && (
								<ListItemSecondaryAction>
									<Button
										color="primary"
										style={{
											maxWidth: "50px",
											maxHeight: "30px",
											fontSize: "10px",
										}}
										variant="contained"
										onClick={() =>
											handleOnClickUpdateSavedEmail({ [userId]: user })
										}
									>
										Update
									</Button>
								</ListItemSecondaryAction>
							)}

							{isEmailsUpdating && (
								<ListItemSecondaryAction>
									<Button
										style={{
											maxWidth: "50px",
											maxHeight: "30px",
											fontSize: "10px",
										}}
										variant="contained"
										disabled
									>
										Update
									</Button>
								</ListItemSecondaryAction>
							)}
						</ListItem>
					);
				})}
		</List>
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
					<Alert severity="info">{Object.keys(storageData).length} saved profile</Alert>
					<div className="users-profile">{populateUsers(storageData)}</div>
					<div className="export-button">{exportButton}</div>
				</div>
			) : (
				<div className="users-profile">{noStorageData}</div>
			)}
		</div>
	);
};

export default SavedProfilesTab;
