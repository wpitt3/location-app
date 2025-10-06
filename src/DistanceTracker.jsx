import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, Target } from 'lucide-react';

export default function DistanceTracker({targetLat, targetLon, updateInterval}) {
    const [userLat, setUserLat] = useState(null);
    const [userLon, setUserLon] = useState(null);
    const [distance, setDistance] = useState(null);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const intervalRef = useRef(null);


    // const [targetLat, setTargetLat] = useState(51.5074);
    // const [targetLon, setTargetLon] = useState(-0.1278);
    // const [updateInterval, setUpdateInterval] = useState(5);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const phi1 = lat1 * Math.PI / 180;
        const phi2 = lat2 * Math.PI / 180;
        const delta_phi = (lat2 - lat1) * Math.PI / 180;
        const delta_lambda = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(delta_phi / 2) * Math.sin(delta_phi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(delta_lambda / 2) * Math.sin(delta_lambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const updateLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setUserLat(lat);
                    setUserLon(lon);
                    const dist = calculateDistance(lat, lon, targetLat, targetLon);
                    setDistance(dist);
                    setLastUpdate(new Date());
                    setError(null);
                },
                (err) => {
                    setError(err.message);
                }
            );
        } else {
            setError('Geolocation is not supported by your browser');
        }
    };

    const startTracking = () => {
        updateLocation();
        intervalRef.current = setInterval(updateLocation, updateInterval * 1000);
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        startTracking();
    }, [updateInterval, targetLat, targetLon]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Navigation className="w-8 h-8 text-indigo-600" />
                        <MapPin className="w-5 h-5 text-green-600" />
                    </div>

                    <div className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}
                        {distance !== null && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                                <p className="text-4xl font-bold text-green-700 mb-2">
                                    {distance.toFixed(2)} m
                                </p>
                                {lastUpdate && (
                                    <p className="text-xs text-gray-500 mt-3">
                                        Last updated: {lastUpdate.toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                        )}

                        {userLat && userLon && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">Your Location</h3>
                                <p className="text-xs text-gray-500">
                                    Lat: {userLat.toFixed(6)}, Lon: {userLon.toFixed(6)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}