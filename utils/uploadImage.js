const uploadImage = async (file) => {
  const formData = new FormData();

  formData.append("image", file.buffer.toString("base64"));

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = await response.json();

  if (!result.success) {
    throw new Error("Image upload failed");
  }

  return result.data.url;
};

export default uploadImage;