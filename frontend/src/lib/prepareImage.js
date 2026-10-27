const MAX_IMAGE_DIMENSION = 1280;

const prepareImage = (file) =>
  new Promise((resolve, reject) => {
    if (!file?.type.startsWith("image/")) {
      reject(new Error("Select an image"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected image"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Could not load the selected image"));
      image.onload = () => {
        try {
          const scale = Math.min(
            1,
            MAX_IMAGE_DIMENSION / Math.max(image.width, image.height),
          );
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Could not prepare the selected image"));
            return;
          }

          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        } catch (error) {
          reject(error);
        }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

export default prepareImage;
