import React from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

import toast from "react-hot-toast";
import { ProfileHeader } from "../components/ProfileHeader";
import { AboutSection } from "../components/AboutSection";
import { ExperienceSection } from "../components/ExperienceSection";
import { EducationSection } from "../components/EducationSection";
import { SkillsSection } from "../components/SkillsSection";
export const Profilepage = () => {

  const { userName } = useParams();
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  
  const { data: userProfile, isLoading: isUserProfileLoading } = useQuery({
    queryKey: ["userProfile", userName],
    queryFn: () => axiosInstance.get(`/users/${userName}`),
  });

  const { mutate: updateProfile } = useMutation({
		mutationFn: async (updatedData) => {
			await axiosInstance.put("/users/profile", updatedData);
		},
		onSuccess: () => {
			toast.success("Profile updated successfully");
			queryClient.invalidateQueries(["userProfile", userName]);
		},
	});

  if (isUserProfileLoading) return null;

  const isOwnProfile = authUser?.userName === userProfile?.data?.userName;
  const userData = isOwnProfile ? authUser : userProfile?.data;

  const handleSave = (updatedData) => {
    updateProfile(updatedData);
  };

  console.log(userData);

  return (
    <div className="bg-[#F4F2EE] py-5 px-80 min-h-screen w-full mx-auto p-4">
      <ProfileHeader
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <AboutSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <ExperienceSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <EducationSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <SkillsSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
    </div>
  );
};
