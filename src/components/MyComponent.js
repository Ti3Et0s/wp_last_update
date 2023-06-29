import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Swal from 'sweetalert2';
import { Button, CircularProgress, Paper, TablePagination } from '@mui/material';


function MyComponent() {
	const [updateMessage, setUpdateMessage] = useState('');
	const [isAnimating, setIsAnimating] = useState(false);
	const [clickTimestamps, setClickTimestamps] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [refreshTable, setRefreshTable] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		fetchClickTimestamps();
	}, [refreshTable]);

	const fetchClickTimestamps = () => {
		setIsRefreshing(true);

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
				setIsRefreshing(false);
			})
			.catch((error) => {
				console.log(error);
				setIsRefreshing(false);
			});
	};

	const handleUpdateClick = () => {
		setUpdateMessage('');
		setIsAnimating(true);

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
						setUpdateMessage(`Last modified times have been updated for ${data.updatedCount} post(s).`);
						Swal.fire({
							icon: 'success',
							title: 'Success',
							text: `Last modified times have been updated for ${data.updatedCount} post(s).`,
						});
					} else {
						setUpdateMessage('Error updating last modified times.');
						Swal.fire({
							icon: 'error',
							title: 'Error',
							text: 'Error updating last modified times.',
						});
					}
					setIsAnimating(false);
					setRefreshTable(!refreshTable); // Trigger table reload
				}, 1000);
			})
			.catch(() => {
				setTimeout(() => {
					setUpdateMessage('Error updating last modified times.');
					setIsAnimating(false);
					Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Error updating last modified times.',
					});
				}, 1000);
			});
	};

	const handleRefresh = () => {
		setIsRefreshing(true); // Start the loading animation
		setRefreshTable(!refreshTable);

		// Add a delay of 500 milliseconds before stopping the loading animation
		setTimeout(() => {
			setIsRefreshing(false);
		}, 500);

		setSearchText(''); // Reset search text
		setPage(0); // Reset page
		setSortModel([]); // Reset sorting
	};

	const columns = [
		{ field: 'id', headerName: 'ID', width: 70 },
		{ field: 'user_name', headerName: 'User ID', width: 150 },
		{ field: 'timestamp', headerName: 'Click Timestamp', width: 200 },
		{ field: 'updatedcount', headerName: 'Updated Counts', width: 200 },
	];

	const sortedClickTimestamps = [...clickTimestamps].sort((a, b) => b.id - a.id);

	const rows = sortedClickTimestamps.map((timestamp, index) => ({
		id: sortedClickTimestamps.length - index, // Set the ID in descending order
		user_name: timestamp.user_name,
		timestamp: timestamp.timestamp,
		updatedcount: timestamp.updatedcount,
	}));

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<div>
			<h2>My React Component</h2>
			<p>This is a React component inside a WordPress plugin.</p>
			<Button variant="contained" color="primary" onClick={handleUpdateClick} disabled={isAnimating}>
				{isAnimating ? <CircularProgress size={20} color="inherit" /> : 'Update Last Modified'}
			</Button>
			<Button
				variant="contained"
				color="secondary"
				onClick={handleRefresh}
				disabled={isRefreshing}
				style={{ marginLeft: '10px' }}
			>
				{isRefreshing ? (
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<CircularProgress size={20} color="secondary" style={{ marginRight: '5px' }} />
						<span>Refreshing...</span>
					</div>
				) : (
					<span>Refresh Table</span>
				)}
			</Button>

			<div style={{ height: 400, width: '100%', marginTop: '20px' }}>
				<DataGrid
					rows={rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
					columns={columns}
					checkboxSelection
					hideFooterSelectedRowCount
					hideFooterPagination
				/>
				<TablePagination
					rowsPerPageOptions={[10, 20, 50]}
					component="div"
					count={rows.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</div>
		</div>
	);
}

export default MyComponent;
