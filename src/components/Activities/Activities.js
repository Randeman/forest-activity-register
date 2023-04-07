import React, { useState, useEffect, useContext } from "react";

import { Layers, TileLayer, VectorLayer } from "../Map/Layers";
import { osm, vector } from "../Map/Source";
import { get } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { Controls, FullScreenControl, MousePositionControl } from "../Map/Controls";
import { featureStyles as FeatureStyles } from "../Map/Features/Styles";

import MapContext from "../../contexts/MapContext";

import './Table/table.css'
import { Table } from './Table/Table'


export const Activities = ({ activities }) => {

  const {  onZoom } = useContext(MapContext);

  const [isLoadedMap, setIsLoadedMap] = useState(false);

  useEffect(() => {

    setIsLoadedMap(true);
  }, [])

  
  const columns = [
    {accessor: "category", label: "Category"},
    {accessor: "district", label: "District"},
    {accessor: "municipality", label: "Municipality"},
    {accessor: "land", label: "Land"},
    {accessor: "start", label: "Start"},
    {accessor: "end", label: "End"},
    {accessor: "zoom", label: "Zoom"},
    {accessor: "details", label: "Details"},
  ];

 
  
  return (
    <>
      <div>
        <Layers>
          <TileLayer source={osm()} zIndex={0} />
          {(!!activities.length && isLoadedMap) && activities.map(a =>
            <VectorLayer key={a._id}
              source={vector({
                features: new GeoJSON()
                  .readFeatures(JSON.parse(a.figure), { featureProjection: get("EPSG:3857") })
              })}
              style={FeatureStyles[JSON.parse(a.figure).features[0].geometry.type]}
            />)}
        </Layers>
        <Controls >
          <FullScreenControl />
          <MousePositionControl />
        </Controls>
      </div>
      {isLoadedMap && <p></p>}
      {(!activities.length && isLoadedMap) && <div>"NO ACTIVITIES YET ..."</div>}
      {(!!activities.length && isLoadedMap) && <Table onZoom={onZoom} columns={columns} rows={activities} />}
      {/* {(!!activities.length && isLoadedMap) && activities.map(a => <div key={a._id}>`{JSON.stringify(a)}`</div>)} */}
    </>
  )
}

