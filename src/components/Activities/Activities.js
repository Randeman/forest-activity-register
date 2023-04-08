import React, { useState, useEffect, useContext, useId } from "react";

import { Layers, TileLayer, VectorLayer } from "../Map/Layers";
import { osm, vector } from "../Map/Source";
import { get } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { Controls, FullScreenControl, MousePositionControl } from "../Map/Controls";
import { featureStyles as FeatureStyles } from "../Map/Features/Styles";

import MapContext from "../../contexts/MapContext";
import './Activities.css'
import './Table/table.css'
import { Table } from './Table/Table'


export const Activities = ({ activities }) => {

  const { onZoom } = useContext(MapContext);

  const [isLoadedMap, setIsLoadedMap] = useState(false);

  useEffect(() => {

    setIsLoadedMap(true);
  }, [])


  const columns = [
    { accessor: "category", id: useId(), label: "Category" },
    { accessor: "district", id: useId(), label: "District" },
    { accessor: "municipality", id: useId(), label: "Municipality" },
    { accessor: "land", id: useId(), label: "Land" },
    { accessor: "start", id: useId(), label: "Start" },
    { accessor: "end", id: useId(), label: "End" },
    { accessor: "zoom", id: useId(), label: "Zoom" },
    { accessor: "details", id: useId(), label: "Details" },
  ];



  return (
    <>
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
      {isLoadedMap && <hr></hr>}
      {(!activities.length && isLoadedMap) && <h3>"NO ACTIVITIES YET ..."</h3>}
      {(!!activities.length && isLoadedMap) && <section id="content">
        {<p></p>}
        <Table onZoom={onZoom} columns={columns} rows={activities} />
      </section>}
      {isLoadedMap && <hr></hr>}
    </>
  )
}

