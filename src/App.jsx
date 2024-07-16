import { useState, useEffect } from "react";
import { XMLParser } from "fast-xml-parser";
import { Card, CardContent, CardHeader } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

SyntaxHighlighter.registerLanguage("xml", xml);

const defaultXML = `<!--Created by Vision4D 4.1.2 tags/4.1.2-release^0@98c73da4661fb18d597af2e61196cc33ab6a833f-->
<pipeline version="4.0" description="Automatically detect large objects having regular or irregular borders" url="arivis-vision4d-manuals:How to Detect Big Structures Auto (Sample Pipeline).pdf" created="0001-01-01T00:00:00" modified="2023-12-28T15:28:04.7734903+01:00">
  <operations>
    <operation type-id="arivis.analysis.selection" id="arivis.analysis.selection1">
      <outputs>[{"Channels":[{"v":1,"id":"arivis.analysis.selection1.0.0","p":null,"n":"Channel 0","a":true}]},{"Channels":[]},{"ObjectTags":[]}]</outputs>
      <settings>{"Document":"E:\\arivis\\_dataroot\\6bubbles.sis","ScopeID":"1","PixelSize":{"X":1.0,"Y":1.0,"Z":5.0},"PixelType":0,"ChannelCount":1,"Bounds":"0, 0, 166, 166","Channels":"1","Planes":"3","Frames":"1","SelectionHint":0,"Zoom":1.0,"ZoomXYOnly":false,"CropToBounds":false,"LegacyMode":false}</settings>
    </operation>
    <operation type-id="arivis.analysis.voxel.Denoising" id="arivis.analysis.voxel.Denoising1" name="Denoising">
      <inputs>[{"Channels":[{"v":1,"id":"arivis.analysis.selection1.0.0"}]}]</inputs>
      <outputs>[{"Channels":[{"v":1,"id":"arivis.analysis.voxel.Denoising1.0.0","p":"arivis.analysis.selection1.0.0","n":"Channel 0","a":true}]}]</outputs>
      <settings algorithmId="arivis.analysis.imagetoimage.denoising.Bilateral" version="1.0" OutputMode="1" OutputFile="" CreateNewChannels="False" NewChannelNamePattern="$o ($n)">
        <strategy planewise="False" />
        <filter>{"IntensityRange":51.0,"Diameter":5.0}</filter>
      </settings>
    </operation>
    <operation type-id="arivis.analysis.voxelresult" id="arivis.analysis.voxelresult1">
      <inputs>[{"Channels":[{"v":1,"id":"arivis.analysis.voxel.Denoising1.0.0"}]}]</inputs>
      <outputs>[{"Channels":[{"v":1,"id":"arivis.analysis.voxelresult1.0.0","p":"arivis.analysis.voxel.Denoising1.0.0","n":"Channel 0","a":true}]},{}]</outputs>
      <settings mode="1" useForAnnotations="false" filename="" scopename="" autochannels="true" />
    </operation>
    <operation type-id="arivis.analysis.segmentation.IntensityThreshold" id="arivis.analysis.segmentation.IntensityThreshold1" name="Otsu Threshold - big structures">
      <inputs>[{"Channels":[{"v":1,"id":"arivis.analysis.voxel.Denoising1.0.0"}]}]</inputs>
      <outputs>[{"ObjectTags":[{"v":1,"id":"arivis.analysis.segmentation.IntensityThreshold1.0.0","p":null,"n":"Otsu Threshold - big structures","a":true,"cm":1,"c":"Cyan"}]}]</outputs>
      <settings labelerid="arivis.analysis.segmentation.intensity.threshold.Auto" object-name-pattern="$t #$I ($o)" version="1.0">
        <strategy planewise="False">
          <restrictor />
          <preparer />
        </strategy>
        <labeler preparation="Plane">{"ThresholdType":0,"Above":true,"UseLegacyMode":false,"Connectivity":1}</labeler>
        <creator useholes="False" />
        <merger>
          <overlapping />
          <validator />
        </merger>
        <filter>
          <filter0>{"Threshold":189.75,"FilterActive":false}</filter0>
          <filter1>{"Active":false,"Size":{"LowerValue":0.10003999999999999,"UpperValue":26.222,"Type":1}}</filter1>
        </filter>
        <publisher />
      </settings>
    </operation>
    <operation type-id="arivis.analysis.store.StoreAnnotation" id="arivis.analysis.store.StoreAnnotation1">
      <inputs>[{"ObjectTags":[{"v":1,"id":"arivis.analysis.segmentation.IntensityThreshold1.0.0"}]}]</inputs>
      <settings version="V_2_12_5">{"NamePattern":"$n","TagPattern":"$n","TagsToAdd":null,"TagsToDelete":null,"PreserveAllTags":false,"KeepOnUndo":false}</settings>
    </operation>
    <operation type-id="arivis.analysis.endOfPipeline" id="arivis.analysis.endOfPipeline1">
      <settings />
    </operation>
  </operations>
  <layout>
    <entry name="arivis.analysis.segmentation.IntensityThreshold1">{"Labeler.Threshold":{"pixeltype":"UInt8","minimum":"0","maximum":"253"},"Filter.Core":{"pixeltype":"UInt8","minimum":"127.5","maximum":"253"}}</entry>
    <entry name="_viewpartstates">arivis.analysis.voxelresult1=collapsed
arivis.analysis.segmentation.IntensityThreshold1=advanced
</entry>
    <entry name="arivis.analysis.store.StoreAnnotation1">[]</entry>
    <entry name="arivis.analysis.voxel.Denoising1">{"Filter.IntensityRange":{"pixeltype":"UInt8","maximum":"255"}}</entry>
  </layout>
  <features><![CDATA[{"Version":"3.1","Features":[]}]]></features>
</pipeline>`;

const XMLPipelineVisualizer = () => {
  const [xmlContent, setXmlContent] = useState(defaultXML);
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    parseXML(xmlContent);
  }, [xmlContent]);

  const parseXML = (content) => {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const result = parser.parse(content);
    setParsedData(result);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setXmlContent(e.target.result);
    };
    reader.readAsText(file);
  };

  const renderOperation = (operation) => (
    <Card key={operation["@_id"]} className="mb-4">
      <CardHeader>
        <h3 className="text-lg font-semibold">{operation["@_type-id"]}</h3>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="inputs">
          <TabsList>
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="outputs">Outputs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="inputs">
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(operation.inputs, null, 2)}
            </pre>
          </TabsContent>
          <TabsContent value="outputs">
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(operation.outputs, null, 2)}
            </pre>
          </TabsContent>
          <TabsContent value="settings">
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(operation.settings, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  const renderOperations = () => {
    if (
      !parsedData ||
      !parsedData.pipeline ||
      !parsedData.pipeline.operations
    ) {
      return null;
    }

    const operations = parsedData.pipeline.operations.operation;
    if (Array.isArray(operations)) {
      return operations.map(renderOperation);
    } else if (typeof operations === "object") {
      return renderOperation(operations);
    }
    return null;
  };

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">XML Pipeline Visualizer</h1>
      <div className="mb-4">
        <input type="file" onChange={handleFileUpload} className="mb-2" />
        <Button onClick={() => setXmlContent(defaultXML)}>
          Reset to Default XML
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 flex-grow overflow-hidden">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-2">XML Content</h2>
          <div className="flex-grow overflow-auto">
            <SyntaxHighlighter language="xml" style={docco} className="h-full">
              {xmlContent}
            </SyntaxHighlighter>
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-2">Parsed Data</h2>
          <div className="flex-grow overflow-auto">
            {parsedData && (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Pipeline Information
                </h3>
                <Card className="mb-4">
                  <CardContent>
                    <p>
                      <strong>Version:</strong>{" "}
                      {parsedData.pipeline["@_version"]}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {parsedData.pipeline["@_description"]}
                    </p>
                    <p>
                      <strong>URL:</strong> {parsedData.pipeline["@_url"]}
                    </p>
                    <p>
                      <strong>Modified:</strong>{" "}
                      {parsedData.pipeline["@_modified"]}
                    </p>
                  </CardContent>
                </Card>
                <h3 className="text-lg font-semibold mb-2">Operations</h3>
                {renderOperations()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default XMLPipelineVisualizer;
