import * as THREE from '/build/three.module.js';
export function createObjectFolder(gui, object, objectName) {
    const objectFolder = gui.addFolder(objectName);
    createObjectPositionFolder(objectFolder, object);
    createObjectRotationFolder(objectFolder, object);
    createObjectScaleFolder(objectFolder, object);
    objectFolder.add(object, "visible", true);
    return objectFolder;
}
export function createCameraFolder(gui, perspectiveCamera, cameraName) {
    const cameraFolder = gui.addFolder(cameraName);
    createObjectPositionFolder(cameraFolder, perspectiveCamera).open();
    createObjectRotationFolder(cameraFolder, perspectiveCamera).open();
    cameraFolder.add(perspectiveCamera, "fov", 40, 120, 0.1).onChange(() => perspectiveCamera.updateProjectionMatrix());
    cameraFolder.add(perspectiveCamera, "near", 0.001, 100, 0.1).onChange(() => perspectiveCamera.updateProjectionMatrix());
    cameraFolder.add(perspectiveCamera, "far", 100, 10000, 1).onChange(() => perspectiveCamera.updateProjectionMatrix());
    cameraFolder.open();
    return cameraFolder;
}
export function createMeshPhysicalMaterialFolder(gui, mesh, meshName) {
    const meshFolder = createObjectFolder(gui, mesh, meshName);
    createPhysicalMaterialFolder(meshFolder, mesh.material);
    return meshFolder;
}
export function createPhysicalMaterialFolder(gui, material) {
    createMaterialFolder(gui, material);
    const data = {
        color: material.color.getHex(),
        emissive: material.emissive.getHex(),
    };
    const physicalMaterialFolder = gui.addFolder('THREE.MeshPhysicalMaterial');
    physicalMaterialFolder.add(material, 'wireframe');
    physicalMaterialFolder.add(material, 'fog');
    physicalMaterialFolder.addColor(data, 'color').onChange(handleColorChange(material.color));
    physicalMaterialFolder.addColor(data, 'emissive').onChange(handleColorChange(material.emissive));
    physicalMaterialFolder.add(material, 'roughness', 0, 1);
    physicalMaterialFolder.add(material, 'metalness', 0, 1);
    physicalMaterialFolder.add(material, 'reflectivity', 0, 1);
    physicalMaterialFolder.add(material, 'clearcoat', 0, 1).step(0.01);
    physicalMaterialFolder.add(material, 'clearcoatRoughness', 0, 1).step(0.01);
    physicalMaterialFolder.add(material, 'wireframeLinewidth', 0, 10);
    // physicalMaterialFolder.open()
    return physicalMaterialFolder;
}
/* UPDATE HELPERS */
function handleColorChange(color) {
    return function (value) {
        if (typeof value === 'string') {
            value = value.replace('#', '0x');
        }
        color.setHex(value);
    };
}
function updateMaterial(material) {
    material.side = Number(material.side);
    material.needsUpdate = true;
}
/* SUB-FOLDERS */
export function createMaterialFolder(gui, material) {
    const materialFolder = gui.addFolder('THREE.Material');
    materialFolder.add(material, 'transparent');
    materialFolder.add(material, 'opacity', 0, 1).step(0.01);
    materialFolder.add(material, 'blending', constants.blendingMode);
    materialFolder.add(material, 'blendSrc', constants.destinationFactors);
    materialFolder.add(material, 'blendDst', constants.destinationFactors);
    materialFolder.add(material, 'blendEquation', constants.equations);
    materialFolder.add(material, 'depthTest');
    materialFolder.add(material, 'depthWrite');
    materialFolder.add(material, 'polygonOffset');
    materialFolder.add(material, 'polygonOffsetFactor');
    materialFolder.add(material, 'polygonOffsetUnits');
    materialFolder.add(material, 'visible');
    // folder.add( material, 'alphaTest', 0, 1 ).step( 0.01 ).onChange( needsUpdate( material, geometry ) );
    // folder.add( material, 'side', constants.side ).onChange( needsUpdate( material, geometry ) );
    // materialFolder.open()
    return materialFolder;
}
function createObjectPositionFolder(parentFolder, object) {
    const objectPositionFolder = parentFolder.addFolder("position");
    objectPositionFolder.add(object.position, "x", -10, 10, 0.01);
    objectPositionFolder.add(object.position, "y", -10, 10, 0.01);
    objectPositionFolder.add(object.position, "z", -10, 10, 0.01);
    return objectPositionFolder;
}
function createObjectScaleFolder(parentFolder, object) {
    const objectScaleFolder = parentFolder.addFolder("scale");
    objectScaleFolder.add(object.scale, "x", 0, 5, 0.1);
    objectScaleFolder.add(object.scale, "y", 0, 5, 0.1);
    objectScaleFolder.add(object.scale, "z", 0, 5, 0.1);
    return objectScaleFolder;
}
function createObjectRotationFolder(parentFolder, object) {
    const objectRotationFolder = parentFolder.addFolder("rotation");
    objectRotationFolder.add(object.rotation, "x", 0, Math.PI * 2, 0.01);
    objectRotationFolder.add(object.rotation, "y", 0, Math.PI * 2, 0.01);
    objectRotationFolder.add(object.rotation, "z", 0, Math.PI * 2, 0.01);
    return objectRotationFolder;
}
const constants = {
    combine: {
        'MultiplyOperation': THREE.MultiplyOperation,
        'MixOperation': THREE.MixOperation,
        'AddOperation': THREE.AddOperation
    },
    side: {
        'FrontSide': THREE.FrontSide,
        'BackSide': THREE.BackSide,
        'DoubleSide': THREE.DoubleSide
    },
    blendingMode: {
        'No': THREE.NoBlending,
        'Normal': THREE.NormalBlending,
        'Additive': THREE.AdditiveBlending,
        'Subtractive': THREE.SubtractiveBlending,
        'Multiply': THREE.MultiplyBlending,
        'Custom': THREE.CustomBlending
    },
    equations: {
        'Add': THREE.AddEquation,
        'Subtract': THREE.SubtractEquation,
        'ReverseSubtract': THREE.ReverseSubtractEquation
    },
    destinationFactors: {
        'Zero': THREE.ZeroFactor,
        'One': THREE.OneFactor,
        'SrcColor': THREE.SrcColorFactor,
        '1-SrcColor': THREE.OneMinusSrcColorFactor,
        'SrcAlphar': THREE.SrcAlphaFactor,
        '1-SrcAlpha': THREE.OneMinusSrcAlphaFactor,
        'DstAlpha': THREE.DstAlphaFactor,
        '1-DstAlpha': THREE.OneMinusDstAlphaFactor
    },
    sourceFactors: {
        'DstColor': THREE.DstColorFactor,
        '1-DstColor': THREE.OneMinusDstColorFactor,
        'SrcAlphaSaturate': THREE.SrcAlphaSaturateFactor
    }
};
