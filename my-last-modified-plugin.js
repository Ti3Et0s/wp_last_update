document.addEventListener('DOMContentLoaded', function () {
	alert('Content loaded');
	const { useState } = wp.element;
	const { Button, Spinner, Dashicon } = wp.components;
	const App = () => {

	}
	/*
			const App = () => {
				const [isUpdating, setIsUpdating] = useState(false);
				const [updateMessage, setUpdateMessage] = useState('');

				const handleUpdateLastModified = () => {
					setIsUpdating(true);
					setUpdateMessage('Updating last modified times...');

					const data = {
						action: 'update_last_modified',
						nonce: wpApiSettings.nonce,
					};

					fetch(ajaxurl, {
						method: 'POST',
						body: new URLSearchParams(data),
					})
						.then(response => response.json())
						.then(result => {
							if (result.success) {
								setUpdateMessage(result.data);
							} else {
								setUpdateMessage('Error updating last modified times.');
							}
						})
						.catch(error => {
							console.error(error);
							setUpdateMessage('Error updating last modified times.');
						})
						.finally(() => {
							setIsUpdating(false);
						});
				};

				return (
					<div>
						<h1>Update Last Modified Time</h1>
						<p>Click the button below to update the last modified time for all pages, posts, and CPTs in the site.</p>
						<Button
							isPrimary
							onClick={handleUpdateLastModified}
							disabled={isUpdating}
						>
							{isUpdating ? (
								<>
									<Spinner />
									Updating...
								</>
							) : (
								<>
									<Dashicon icon="update" />
									Update Last Modified
								</>
							)}
						</Button>
						{updateMessage && <div>{updateMessage}</div>}
					</div>
				);
			}; */

	wp.element.render(<App />, document.getElementById('my-last-modified-plugin-root'));
});
