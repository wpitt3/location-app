import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, Target } from 'lucide-react';

export default function DistanceTracker({targetLat, targetLon, updateInterval=5, complete}) {
    const [userLat, setUserLat] = useState(null);
    const [userLon, setUserLon] = useState(null);
    const [distance, setDistance] = useState(null);
    const [distanceDelta, setDistanceDelta] = useState(0);
    const [bearing, setBearing] = useState(null);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const intervalRef = useRef(null);

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

    const calculateBearing = (lat1, lon1, lat2, lon2) => {
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
        const θ = Math.atan2(y, x);
        const bearing = (θ * 180 / Math.PI + 360) % 360;

        return bearing;
    };

    const getCompassDirection = (bearing) => {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
            'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(bearing / 22.5) % 16;
        return directions[index];
    };

    const updateLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const dist = calculateDistance(lat, lon, targetLat, targetLon);
                    const bear = calculateBearing(lat, lon, targetLat, targetLon);
                    setBearing(bear);
                    if (distance != null) {
                        setDistanceDelta(distance - dist)
                    }
                    setUserLat(lat);
                    setUserLon(lon);
                    setDistance(dist);
                    if (dist < 10) {
                        complete()
                    }
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
                        {distance !== null && bearing !== null && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                                <p className="text-4xl font-bold text-green-700 mb-2">
                                    {distance.toFixed(2)} m  {getCompassDirection(bearing)} ({distanceDelta.toFixed(2)} m)
                                </p>
                                {lastUpdate && (
                                    <p className="text-xs text-gray-500 mt-3">
                                        Last updated: {lastUpdate.toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}