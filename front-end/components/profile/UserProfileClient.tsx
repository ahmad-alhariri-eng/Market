"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

import { profileService } from "@/services/profileService";
import { Profile } from "@/types/profile";
import {
    FaUser,
    FaSpinner,
    FaCheckCircle,
    FaTimesCircle,
    FaCamera,
    FaStore,
    FaAward,
    FaPhone,
    FaMapMarkerAlt,
} from "react-icons/fa";
import Image from "next/image";

interface UserProfileClientProps {
    id: number;
}

export default function UserProfileClient({ id }: UserProfileClientProps) {
    const t = useTranslations("Profile");
    // const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchProfile = useCallback(async () => {
        // If we're looking at our own profile and we have the user object, we might want to use that?
        // But the route is /profile/[id], so it could be any user.
        // However, the original code had `if (!user?.id) return;` which implies it might be restricted or checking auth first.
        // Let's assume we fetch the profile by ID regardless of who is logged in, but maybe we need auth token?
        // The original code used `user?.id` dependency but fetched by `params.id`.

        try {
            setLoading(true);
            setError("");
            const profileData = await profileService.getProfile(id);
            setProfile(profileData);
        } catch (err) {
            const message = err instanceof Error ? err.message : t("fetch_error");
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const getImageUrl = (imagePath: string | null) => {
        if (!imagePath) return null;
        const baseUrl =
            process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://127.0.0.1:8000";
        return `${baseUrl}${imagePath}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FaSpinner className="animate-spin h-8 w-8 text-primary-600" />
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-error-600 dark:text-error-400 text-center">
                    <FaTimesCircle className="h-12 w-12 mx-auto mb-4" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-background rounded-lg shadow-lg p-6">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground">
                            {t("profile")}
                        </h1>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-muted dark:bg-gray-700 rounded-lg p-6 mb-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Profile Image */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
                                    {profile?.image ? (
                                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-lg">
                                            <Image
                                                src={getImageUrl(profile.image) || "/images/placeholder-user.jpg"}
                                                alt={profile.username || "User Avatar"}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <FaUser className="h-16 w-16 text-primary-600 dark:text-primary-400" />
                                    )}
                                </div>

                                <label
                                    htmlFor="profile-image"
                                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    {imageLoading ? (
                                        <FaSpinner className="animate-spin h-6 w-6 text-white" />
                                    ) : (
                                        <FaCamera className="h-6 w-6 text-white" />
                                    )}
                                </label>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                    <h2 className="text-2xl font-semibold text-foreground">
                                        {profile?.first_name} {profile?.last_name}
                                    </h2>
                                    {profile?.role === "seller" && (
                                        <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                            <FaStore className="h-4 w-4" />
                                            {t("seller")}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-foreground">
                                        <span className="font-medium">@{profile?.username}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-foreground">
                                        <FaPhone className="h-4 w-4 text-muted-foreground" />
                                        <span>{profile?.phone_number}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-foreground">
                                        <FaMapMarkerAlt className="h-4 w-4 text-muted-foreground" />
                                        <span>{profile?.address}</span>
                                    </div>

                                    {profile?.role === "seller" && (
                                        <>
                                            <div className="flex items-center gap-2 text-foreground">
                                                <FaAward className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    {t("points")}: {profile?.points || 0}
                                                </span>
                                            </div>

                                            {profile?.is_verified_seller && (
                                                <div className="inline-flex items-center gap-2 bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200 px-3 py-1 rounded-full text-sm">
                                                    <FaCheckCircle className="h-4 w-4" />
                                                    {t("verified_seller")}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {profile?.bio && (
                            <div className="mt-6 pt-6 border-t border-border">
                                <h3 className="text-lg font-medium text-foreground mb-2">
                                    {t("bio")}
                                </h3>
                                <p className="text-muted-foreground">{profile.bio}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
