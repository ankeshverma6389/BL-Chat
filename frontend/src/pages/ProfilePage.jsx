import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import prepareImage from "../lib/prepareImage";
const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const [selectedImg, setSelectedImg] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const navigate = useNavigate();
  const [name, setname] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setSelectedImg(file || null);
    setPreviewUrl("");
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPreviewUrl(reader.result);
    };
    reader.onerror = () => toast.error("Could not read the selected image");
    reader.readAsDataURL(file);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImg) {
      const updated = await updateProfile({ fullName: name, bio });
      if (updated) navigate("/");
      return;
    }
    try {
      const base64Image = await prepareImage(selectedImg);
      const updated = await updateProfile({
        profilePic: base64Image,
        fullName: name,
        bio,
      });
      if (updated) navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg ">Profile details</h3>
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={handleImageChange}
              type="file"
              id="avatar"
              accept="image/*"
              hidden
            />
            <img
              src={
                previewUrl
                  ? previewUrl
                  : assets.avatar_icon
              }
              alt=""
              className={`w-12 h-12 ${selectedImg && "rounded-full"}`}
            />
            Upload Profile Image
          </label>
          <input
            onChange={(e) => setname(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your Name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            required
            placeholder="write profile bio"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={4}
          ></textarea>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer"
          >
            Save
          </button>
        </form>
        <img
          className={`max-w-44 aspect-aquare rounded-full mx-10 max-sm:mask-t-from-10 ${selectedImg && "rounded-full"}`}
          src={
            previewUrl
              ? previewUrl
              : authUser.profilePic || assets.logo_icon
          }
          alt=""
        />
      </div>
    </div>
  );
};

export default ProfilePage;
