// MyTable.js
import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TablePagination } from '@mui/material';

function MyTable({ rows, columns, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage }) {
	return (
		<div style={{ height: 400, width: '100%', marginTop: '20px' }}>
			<DataGrid
				loading={loading} slots={{ toolbar: GridToolbar }}
				rows={rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
				columns={columns}
				checkboxSelection
				hideFooterSelectedRowCount
				hideFooterPagination
				autoHeight
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
	);
}

export default MyTable;
