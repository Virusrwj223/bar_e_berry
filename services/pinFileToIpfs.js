import axios from "axios";
import FormData from "form-data";

const JWT =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxYmU2N2VmMy02ODA5LTRlOWQtOWNkZC0wZTQwNzJiYmY4M2YiLCJlbWFpbCI6InZpcnVzcndqQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxOGE3OTA0Y2VkMDcxZWFjNzliMSIsInNjb3BlZEtleVNlY3JldCI6ImRiOTYzZTgwMjQzNmE2MWM3NmIwZWZiMzA3ZTA4ZTM4YjJmOWU2MmYyZTZhMjllYjhjMDUwMjQyOGNmMmYzNDgiLCJpYXQiOjE3MDQ0MjQ5NDJ9.1nyLV9j-w4SVJKvI-xpEexP7qBqGYf7uyk8sFp1c3Rk";
let cid = "";

const pinJSONToIPFS = async (
  cid,
  title,
  description,
  rentalDuration,
  rentalDeposit,
  monthlyRental
) => {
  const data = JSON.stringify({
    pinataContent: {
      name: `${title}`,
      description: `${description}`,
      external_url: `https://pinata.cloud`,
      image: `ipfs://${cid}`,
    },
    pinataMetadata: {
      name: `${title}`,
      keyvalues: {
        title: `${title}`,
        description: `${description}`,
        rentalDuration: `${rentalDuration}`,
        rentalDeposit: `${rentalDeposit}`,
        monthlyRental: `${monthlyRental}`,
      },
    },
  });

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: JWT,
        },
      }
    );
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const pinFileToIPFS = async (
  title,
  description,
  rentalDuration,
  rentalDeposit,
  monthlyRental,
  img
) => {
  const formData = new FormData();
  //const src = "BASA_Icon.png";

  //const file = () => fs.createReadStream(src);
  formData.append("file", img);

  const pinataMetadata = JSON.stringify({
    name: `${title}`,
  });
  formData.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append("pinataOptions", pinataOptions);

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: JWT,
        },
      }
    );
    console.log(res.data);
    cid = res.data["IpfsHash"];

    return pinJSONToIPFS(
      res.data["IpfsHash"],
      title,
      description,
      rentalDuration,
      rentalDeposit,
      monthlyRental
    );
  } catch (error) {
    console.log(error);
  }
};

export default pinFileToIPFS;
