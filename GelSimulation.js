import React, { useState } from 'react';

const wellOptions = [12, 16, 24];
const dnaMarkers = [
    { length: 250 },
    { length: 500 },
    { length: 750 },
    { length: 1000 },
    { length: 1500 },
    { length: 2000 },
    { length: 2500 },
    { length: 3000 },
    { length: 4000 },
    { length: 5000 },
    { length: 6000 },
    { length: 8000 },
    { length: 10000 },
];

const r = 1.2;
const k = -27 * r; // 定数
const a = 279 * r; // 定数
const b = 10;

function GelSimulation() {
    const [numWells, setNumWells] = useState(12);
    const [samples, setSamples] = useState(Array(12).fill(''));
    const [electrophoresisTime, setElectrophoresisTime] = useState(3);
    const [markerColor, setMarkerColor] = useState('#ffffff'); // マーカーの色の状態を追加
    const [sampleColor, setSampleColor] = useState('#ffffff'); // サンプルの色の状態を追加
    const [bgColor, setBgColor] = useState('#595959'); // ゲルの色の状態を追加

    const handleWellChange = (event) => {
        const newNumWells = parseInt(event.target.value);
        setNumWells(newNumWells);
        setSamples(Array(newNumWells).fill(''));
    };

    const handleSampleChange = (index, event) => {
        const newSamples = [...samples];
        newSamples[index] = event.target.value;
        setSamples(newSamples);
    };

    const handleTimeChange = (event) => {
        setElectrophoresisTime(parseFloat(event.target.value));
    };

    const handleMarkerColorChange = (event) => {
        setMarkerColor(event.target.value);
    };

    const handleSampleColorChange = (event) => {
        setSampleColor(event.target.value);
    };

    const handleBgColorChange = (event) => {
        setBgColor(event.target.value);
    };

    const calculateMobility = (dna_length, electrophoresisTime) => {
        return (k * Math.log(dna_length) + a) * electrophoresisTime * 0.2;
    };

    const adjustMobility = (mobility, referenceMobility) => {
        return mobility - referenceMobility + b;
    };

    const referenceMobility = calculateMobility(10000, electrophoresisTime);

    const getTextColor = (bgColor) => {
        // sRGB を RGB に変換し、背景色の相対輝度を求める
        const toRgbItem = (item) => {
            const i = item / 255;
            return i <= 0.03928 ? i / 12.92 : Math.pow((i + 0.055) / 1.055, 2.4);
        };

        const r = parseInt(bgColor.slice(1, 3), 16);
        const g = parseInt(bgColor.slice(3, 5), 16);
        const b = parseInt(bgColor.slice(5, 7), 16);

        const R = toRgbItem(r);
        const G = toRgbItem(g);
        const B = toRgbItem(b);

        const Lbg = 0.2126 * R + 0.7152 * G + 0.0722 * B;

        // 白と黒の相対輝度。定義からそれぞれ 1 と 0 になる。
        const Lw = 1;
        const Lb = 0;

        // 白と背景色のコントラスト比、黒と背景色のコントラスト比をそれぞれ求める。
        const Cw = (Lw + 0.05) / (Lbg + 0.05);
        const Cb = (Lbg + 0.05) / (Lb + 0.05);

        // コントラスト比が大きい方を文字色として返す。
        return Cw < Cb ? 'black' : 'white';
    };

    const textColor = getTextColor(bgColor);

    return (
        <div>
            <label htmlFor="wellSelect">Select number of wells: </label>
            <select id="wellSelect" value={numWells} onChange={handleWellChange}>
                {wellOptions.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            <div>
                {Array.from({ length: numWells }).map((_, index) => (
                    <div key={index}>
                        <label>Sample {index + 1} DNA length (bp): </label>
                        <input
                            type="text"
                            value={samples[index]}
                            onChange={(event) => handleSampleChange(index, event)}
                            placeholder="e.g., 500, 1000, 1500"
                        />
                    </div>
                ))}
            </div>
            <div>
                <label htmlFor="bgColor">Background Color: </label>
                <input
                    type="color"
                    id="bgColor"
                    value={bgColor}
                    onChange={handleBgColorChange}
                />
            </div>
            {/*
            <div>
                <label htmlFor="markerColor">Marker Color: </label>
                <input
                    type="color"
                    id="markerColor"
                    value={markerColor}
                    onChange={handleMarkerColorChange}
                />
            </div>
            <div>
                <label htmlFor="sampleColor">Sample Color: </label>
                <input
                    type="color"
                    id="sampleColor"
                    value={sampleColor}
                    onChange={handleSampleColorChange}
                />
            </div>
*/}
            <div>
                <label htmlFor="timeSelect">Electrophoresis time: </label>
                <input
                    type="range"
                    id="timeSelect"
                    min="0.5"
                    max="5"
                    step="0.5"
                    value={electrophoresisTime}
                    onChange={handleTimeChange}
                />
                <span>x {electrophoresisTime}</span>
            </div>
            <svg width="800" height="400" style={{ backgroundColor: bgColor }}>
                <text x="70" y="20" fill={textColor} fontSize="14">Mw</text>
                {Array.from({ length: numWells }).map((_, index) => (
                    <text
                        key={index}
                        x={105 + index * 28 - (index >= 9 ? 3 : 0)}
                        y="20"
                        fill={textColor}
                        fontSize="14"
                    >
                        {index + 1}
                    </text>
                ))}
                {dnaMarkers.map((marker, index) => (
                    <g key={index}>
                        <rect
                            x="70"
                            y={adjustMobility(calculateMobility(marker.length, electrophoresisTime), referenceMobility) * 4}
                            width="20"
                            height="3"
                            fill={textColor}
                        //                            fill={markerColor}
                        //                            opacity="0.7"
                        />
                        <text
                            x="20"
                            y={adjustMobility(calculateMobility(marker.length, electrophoresisTime), referenceMobility) * 4 + 5}
                            fill={textColor}
                            fontSize="11"
                        >
                            {marker.length} bp
                        </text>
                    </g>
                ))}
                {samples.map((sample, index) => (
                    sample.split(',').map((length, subIndex) => (
                        <rect
                            key={`${index}-${subIndex}`}
                            x={100 + index * 28}
                            y={adjustMobility(calculateMobility(parseFloat(length), electrophoresisTime), referenceMobility) * 4}
                            width="20"
                            height="3"
                            fill={textColor}
                        //                            fill={sampleColor}
                        //                            opacity="0.7"
                        />
                    ))
                ))}
            </svg>
        </div>
    );
}

export default GelSimulation;
