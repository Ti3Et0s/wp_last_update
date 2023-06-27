import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function MyComponent() {
	const [updateMessage, setUpdateMessage] = useState('');
	const [isAnimating, setIsAnimating] = useState(false);
	const [clickTimestamps, setClickTimestamps] = useState([]);
	const [updatedCount, setUpdatedCount] = useState(0);

	useEffect(() => {
		fetchClickTimestamps();
	}, []);

	const fetchClickTimestamps = () => {
		axios({
			method: 'post',
			url: myAjax.ajaxurl,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			data: new URLSearchParams({
				action: 'fetch_click_timestamps',
				nonce: fetchClickTimestampsNonce,
			}).toString(),
		})
			.then((response) => {
				const data = response.data;
				if (data.success) {
					setClickTimestamps(data.data);
				}
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const handleUpdateClick = () => {
		setUpdateMessage('');
		setIsAnimating(true);

		// Send AJAX request to update last modified times
		axios({
			method: 'post',
			url: myAjax.ajaxurl,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			data: new URLSearchParams({
				action: 'update_last_modified',
				nonce: updateLastModifiedNonce,
			}).toString(),
		})
			.then((response) => {
				const data = response.data;
				console.log(data);
				setTimeout(() => {
					if (data.success) {
						setUpdatedCount(data.updatedCount);
						setUpdateMessage(`Last modified times have been updated for ${data.updatedCount} post(s).`);
					} else {
						setUpdateMessage('Error updating last modified times.');
					}
					setIsAnimating(false);
					fetchClickTimestamps(); // Fetch updated click timestamps
				}, 1000); // Add a delay of 1 second (1000 milliseconds)
			})
			.catch(() => {
				setTimeout(() => {
					setUpdateMessage('Error updating last modified times.');
					setIsAnimating(false);
				}, 1000); // Add a delay of 1 second (1000 milliseconds)
			});
	};
	// console.log(clickTimestamps);
	return (
		<div>
			<h2>My React Component</h2>
			<p>This is a React component inside a WordPress plugin.</p>
			<Button variant="contained" color="primary" onClick={handleUpdateClick} disabled={isAnimating}>
				{isAnimating ? <CircularProgress size={20} color="inherit" /> : 'Update Last Modified'}
			</Button>
			{updateMessage && (
				<Alert severity={updateMessage.includes('Error') ? 'error' : 'success'}>
					{updateMessage}
					{updatedCount > 0 && <span> Pages, posts, and CPTs updated: {updatedCount}</span>}
				</Alert>
			)}

			<TableContainer component={Paper} style={{ marginTop: '20px' }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>User ID</TableCell>
							<TableCell>Click Timestamps</TableCell>
							<TableCell>Updated Counts</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{clickTimestamps.length > 0 ? (
							clickTimestamps.map((timestamp, index) => (
								<TableRow key={index}>
									<TableCell>{timestamp.user_name}</TableCell>
									<TableCell>{timestamp.timestamp}</TableCell>
									<TableCell>{timestamp.updatedcount}</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={2}>No click timestamps found.</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	);
}

export default MyComponent;
