// api.js
import axios from 'axios';
import Swal from 'sweetalert2';

export function fetchClickTimestamps(fetchClickTimestampsNonce) {
  return axios
    .post(
      myAjax.ajaxurl,
      new URLSearchParams({
        action: 'fetch_click_timestamps',
        nonce: fetchClickTimestampsNonce,
      }).toString()
    )
    .then((response) => {
      const data = response.data;
      if (data.success) {
        return data.data;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch click timestamps.',
        });
        return [];
      }
    })
    .catch((error) => {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch click timestamps.',
      });
      return [];
    });
}

export async function updateLastModified(updateLastModifiedNonce) {
  try {
    const response = await axios.post(
      myAjax.ajaxurl,
      new URLSearchParams({
        action: 'update_last_modified',
        nonce: updateLastModifiedNonce,
      }).toString()
    );

    const data = response.data;
    console.log(data);

    if (data.success) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Last modified times have been updated for ${data.updatedCount} post(s).`,
      });
      return data.updatedCount;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error updating last modified times.',
      });
      return 0;
    }
  } catch (error) {
    console.log(error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error updating last modified times.',
    });
    return 0;
  }
}
