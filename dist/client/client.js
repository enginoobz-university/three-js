import * as THREE from '/build/three.module.js';
import { Tasks } from './task_management.js';
import { OrbitControls } from '/jsm/controls/OrbitControls.js';
import { DragControls } from '/jsm/controls/DragControls.js';
import { TransformControls } from '/jsm/controls/TransformControls.js';
import { PointerLockControls } from '/jsm/controls/PointerLockControls.js';
import Stats from '/jsm/libs/stats.module.js';
import { GUI } from '/jsm/libs/dat.gui.module.js';
import * as DatHelper from './helpers/dat_helper.js';
import { VRButton } from '/jsm/webxr/VRButton.js';
import { EffectComposer } from '/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/jsm/postprocessing/RenderPass.js';
// import { BloomPass } from '/jsm/postprocessing/BloomPass.js'
import { FilmPass } from '/jsm/postprocessing/FilmPass.js';
import { SMAAPass } from '/jsm/postprocessing/SMAAPass.js';
export let camera;
const CAMERA_FOV = 50; //degrees
const CAMERA_NEAR = 0.001;
const CAMERA_FAR = 1000;
let pause = false;
export let muted = true;
let orbitControlsEnabled = true;
let currentTask; // TODO: use type, maybe create class for each task?
const FIRST_SCENE_INDEX = 2;
let currentScene;
const canvas = document.getElementById("threejs-canvas");
export const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false });
let composer;
// let bloomPass: BloomPass
let filmPass;
const gui = new GUI();
let postProcessingFolder = gui.addFolder("Post processing");
let statsGUIs = [];
let transformModeControler;
let pointerLockControlEnableControler;
let sourceLink;
const vrButton = VRButton.createButton(renderer);
export let orbitControls;
export let dragControls;
export let transformControls;
export let pointerLockControls;
const SOURCE_LINK_BASE = 'https://github.com/enginoobz-university/three-js/tree/master/src/client/tasks/';
const STATS_WIDTH = '100%';
const STATS_HEIGHT = '100%';
/* HELPERS */
const AXE_LENGHT = 5;
const axesHelper = new THREE.AxesHelper(AXE_LENGHT);
const GRID_SIZE = 10;
const GRID_DIVISIONS = 10;
const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_DIVISIONS);
let cameraHelper;
const Data = {
    BloomPass: {
        opacity: 1
    },
    FilmPass: {
        grayscale: 0,
        nIntensity: 0,
        sIntensity: 0,
        sCount: 0
    },
    TransformControls: {
        mode: "scale"
    },
    DragControls: {
        opacity: 0.33,
    },
};
export const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
init();
animate(1);
function init() {
    camera = createCamera();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.outputEncoding = THREE.sRGBEncoding
    renderer.xr.enabled = true;
    document.body.appendChild(vrButton);
    vrButton.style.marginBottom = "80px";
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    //document.body.appendChild(renderer.domElement)
    dragControls = new DragControls([], camera, renderer.domElement);
    createControls();
    createControlFolder();
    createStatsGUI();
    createHelperGUIFolder();
    DatHelper.createCameraFolder(gui, camera, 'Perspective Camera');
    // createPostProcessingFolder()
    switchScene(FIRST_SCENE_INDEX);
}
function createControls() {
    pointerLockControls = new PointerLockControls(camera, renderer.domElement);
    pointerLockControls.addEventListener('unlock', function () {
        pointerLockControlEnableControler.name('enabled');
        pointerLockControlEnableControler.setValue(false);
    });
    pointerLockControls.addEventListener('lock', function () {
        pointerLockControlEnableControler.name('disable (Esc)');
    });
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.minDistance = 2;
    orbitControls.maxDistance = 300;
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    // orbitControlsEnabled=false
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setMode("scale");
    transformControls.addEventListener('dragging-changed', function (event) {
        orbitControls.enabled = !event.value;
        dragControls.enabled = !event.value;
    });
}
export function attachToDragControls(objects) {
    dragControls.dispose();
    dragControls = new DragControls(objects, camera, renderer.domElement);
    dragControls.addEventListener("hoveron", function (event) {
        orbitControls.enabled = false;
        // const elme = document.querySelector('html')! as HTMLElement
        // elme.style.cursor = 'move'
    });
    dragControls.addEventListener("hoveroff", function () {
        orbitControls.enabled = true;
    });
    dragControls.addEventListener('dragstart', function (event) {
        event.object.material.opacity = Data.DragControls.opacity;
        // event.object.material.emissive.setHex(Data.DragControls.emissive);
    });
    dragControls.addEventListener('dragend', function (event) {
        event.object.material.opacity = 1;
        // event.object.material.emissive.setHex(0x000000);        
    });
}
function createCamera() {
    const newCamera = new THREE.PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, CAMERA_NEAR, CAMERA_FAR);
    newCamera.position.set(12, 12, 12);
    cameraHelper = new THREE.CameraHelper(newCamera);
    cameraHelper.visible = false;
    return newCamera;
}
function createControlFolder() {
    const options = {
        "Scale (S)": 'scale',
        "Rotate (R)": 'rotate',
        "Translate (T)": 'translate'
    };
    const controlFolder = gui.addFolder("Controls");
    const transformControlsFolder = controlFolder.addFolder("TransformControls");
    transformControlsFolder.add(transformControls, 'enabled', true);
    transformModeControler = transformControlsFolder.add(Data.TransformControls, 'mode', options).name('Transform mode').onChange((value) => transformControls.setMode(value));
    transformControlsFolder.open();
    const dragControlsFolder = controlFolder.addFolder("DragControls");
    // dragControlsFolder.addColor(Data.DragControls, 'emissive').onChange((value) => { Data.DragControls.emissive = Number(value.toString().replace('#', '0x')) });
    dragControlsFolder.add(Data.DragControls, 'opacity', 0.1, 1, 0.1);
    dragControlsFolder.open();
    const pointerLockControlsFolder = controlFolder.addFolder("PointerLockControls");
    pointerLockControlEnableControler = pointerLockControlsFolder.add(pointerLockControls, 'isLocked').name("enabled").onChange((value) => {
        if (value) {
            orbitControlsEnabled = false;
            pointerLockControls.lock();
        }
        else {
            orbitControlsEnabled = true;
            pointerLockControls.unlock();
        }
    });
    pointerLockControlsFolder.open();
    const orbitControlsFolder = controlFolder.addFolder("OrbitControls");
    orbitControlsFolder.add(orbitControls, 'enabled', true).onChange((value) => {
        orbitControlsEnabled = value;
    });
    orbitControlsFolder.add(orbitControls, 'autoRotate', false);
    orbitControlsFolder.add(orbitControls, 'autoRotateSpeed', 1, 20, 1);
    orbitControlsFolder.add(orbitControls, 'enableDamping', true);
    orbitControlsFolder.add(orbitControls, 'dampingFactor', 0.01, 0.1, 0.01);
    orbitControlsFolder.add(orbitControls, 'minDistance', 0, 100, 1);
    orbitControlsFolder.add(orbitControls, 'maxDistance', 100, 300, 10);
    // orbitControlsFolder.add(orbitControls, 'screenSpacePanning', true)
    // orbitControlsFolder.add(orbitControls, 'minAzimuthAngle', 0, Math.PI / 8, 0.1)
    // orbitControlsFolder.add(orbitControls, 'maxAzimuthAngle', 0, Math.PI / 2, 0.1)
    // orbitControlsFolder.add(orbitControls, 'minPolarAngle', 0, Math.PI / 8, 0.1)
    // orbitControlsFolder.add(orbitControls, 'maxPolarAngle', 0, Math.PI / 8, 0.1)
    // controls.enableKeys = true
    // controls.keys = {
    //     LEFT: 37, //left arrow
    //     UP: 38, // up arrow
    //     RIGHT: 39, // right arrow
    //     BOTTOM: 40 // down arrow
    // }
    // controls.mouseButtons = {
    //     LEFT: THREE.MOUSE.ROTATE,
    //     MIDDLE: THREE.MOUSE.DOLLY,
    //     RIGHT: THREE.MOUSE.PAN
    // }
    // controls.touches = {
    //     ONE: THREE.TOUCH.ROTATE,
    //     TWO: THREE.TOUCH.DOLLY_PAN
    // }
    controlFolder.open();
    return controlFolder;
}
function createHelperGUIFolder() {
    const helperFolder = gui.addFolder("Helpers");
    // const options = {
    //     "Show all": true,
    //     "Hide all": false,
    // }
    // helperFolder.add(Data, 'ShowHelpers', options).name("").onChange((value) => {
    //     axesHelper.visible = value
    //     gridHelper.visible = value
    //     cameraHelper.visible = value
    // })
    helperFolder.addFolder("Axes").add(axesHelper, "visible", true);
    helperFolder.addFolder("Grid").add(gridHelper, "visible", true);
    helperFolder.addFolder("Camera").add(cameraHelper, "visible", false);
    // helperFolder.open()
    return helperFolder;
}
function createPostProcessingFolder() {
    // gui.removeFolder(bloomFolder)
    // const newBloomPassFolder = gui.addFolder('BloomPass');
    // newBloomPassFolder.add((<any>bloomPass.copyUniforms).opacity, 'value', 0, 2).name('strength').onChange((value) => {
    //     Data.BloomPass.opacity = value
    // })
    // // TODO: update other properties of bloomPass
    // // newBloomPassFolder.add(bloomPass, 'resolution', 1, 256, 1)
    // newBloomPassFolder.open();
    // bloomFolder = newBloomPassFolder
    gui.removeFolder(postProcessingFolder);
    postProcessingFolder = gui.addFolder("Post processing");
    const newFilmPassFolder = postProcessingFolder.addFolder('FilmPass');
    newFilmPassFolder.add(filmPass.uniforms.grayscale, 'value', 0, 1, 1).name('grayscale').onChange((value) => Data.FilmPass.grayscale = value);
    newFilmPassFolder.add(filmPass.uniforms.nIntensity, 'value', 0, 1).name('noise intensity').onChange((value) => Data.FilmPass.nIntensity = value);
    // TODO: no-impact properties???
    // newFilmPassFolder.add((<any>filmPass.uniforms).sIntensity, 'value', 0, 1).name('scanline intensity').onChange((value) => Data.FilmPass.sIntensity = value)
    // newFilmPassFolder.add((<any>filmPass.uniforms).sCount, 'value', 0, 1000).name('scanline count').onChange((value) => Data.FilmPass.sCount = value)
    newFilmPassFolder.open();
    postProcessingFolder.open();
}
function switchScene(scenceIndex) {
    // if switch scene at least one time
    if (currentTask !== undefined) {
        unselectPreviousObject();
        // destroy Dat GUI for previous scene (if it exists)
        if (currentTask.gui !== undefined) {
            currentTask.gui.destroy();
        }
    }
    currentTask = Array.from(Tasks)[scenceIndex][0];
    if (!currentTask.isInitialized) {
        currentTask.init();
    }
    // create Dat GUI for current scene
    currentTask.createDatGUI();
    currentTask.setupControls();
    currentScene = currentTask.scene;
    // update source link corresponding to current task (scene)
    sourceLink = SOURCE_LINK_BASE + Array.from(Tasks)[scenceIndex][1];
    currentScene.add(axesHelper);
    currentScene.add(gridHelper);
    currentScene.add(cameraHelper);
    orbitControls.enabled = orbitControlsEnabled;
    updatePostProcessing();
}
function updatePostProcessing() {
    // reset composer
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(currentScene, camera));
    // bloomPass = new BloomPass(
    //     Data.BloomPass.opacity,    // strength
    //     25,   // kernel size
    //     4,    // sigma ?
    //     256,  // blur render target resolution
    // );
    // composer.addPass(bloomPass);
    filmPass = new FilmPass(Data.FilmPass.nIntensity, Data.FilmPass.sIntensity, Data.FilmPass.sCount, Data.FilmPass.grayscale);
    filmPass.renderToScreen = true;
    composer.addPass(filmPass);
    // for antialias since built-in antialiasing doesn’t work with post-processing
    const smaaPass = new SMAAPass(window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());
    composer.addPass(smaaPass);
    createPostProcessingFolder();
}
function createStatsGUI() {
    for (let i = 0; i < 3; i++) {
        const statsGUI = Stats();
        statsGUI.showPanel(i); // 0: fps, 1: ms, 2: mb, 3+: custom
        statsGUI.dom.style.top = `${60 * i + 100}px`;
        statsGUIs.push(statsGUI);
        document.body.appendChild(statsGUI.dom);
        const children = statsGUI.dom.childNodes;
        children.forEach(child => {
            child.style.width = STATS_WIDTH;
            child.style.height = STATS_HEIGHT;
        });
    }
}
function animate(time) {
    time *= 0.001; // convert to seconde
    // console.log(Math.floor(time))
    if (renderer.xr.isPresenting) {
        renderer.setAnimationLoop(animate);
    }
    else {
        requestAnimationFrame(animate);
    }
    render();
}
function render() {
    raycaster.setFromCamera(mouse, camera);
    if (!pause) { // only render current active scene
        currentTask.render();
    }
    // updateSelectObject()
    composer.render();
    if (orbitControlsEnabled) {
        orbitControls.update();
    }
    for (let i = 0; i < statsGUIs.length; i++) {
        statsGUIs[i].update();
    }
}
/* WINDOW EVENTS */
// caculate mouse position for ray caster
window.addEventListener('click', onWindowClick, false);
function onWindowClick(event) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // TODO: need to set time out for some reasons? 
    setTimeout(updateSelectObject, 10);
}
function updateSelectObject() {
    const intersectObjects = raycaster.intersectObjects(currentTask.transformableObjects, false);
    if (intersectObjects.length) {
        try {
            unselectPreviousObject();
            // get the object on top where mouse currently points to
            const currentSelectedObject = intersectObjects[0].object;
            transformControls.attach(currentSelectedObject);
            // TODO: problem with definition file (types): emissive not exist on THREE.Material
            currentSelectedObject.material.emissive.set(0x444444);
            currentTask.setSelectedObjectId(currentSelectedObject.id);
        }
        catch (error) {
            if (error instanceof TypeError)
                console.log('The material type of selected object does not have emissive property :(');
        }
    }
}
function unselectPreviousObject() {
    if (currentTask.selectedObjectId != -1) {
        // do s.t with previous selected object 
        const previousSelectedObject = currentScene.getObjectById(currentTask.selectedObjectId);
        previousSelectedObject.material.emissive.set(0x000000);
    }
}
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // render()
}
window.addEventListener('keydown', function (event) {
    switch (event.key) {
        case "t":
            transformControls.setMode("translate");
            // update GUI when using keyboard
            transformModeControler.setValue('translate');
            break;
        case "r":
            transformControls.setMode("rotate");
            transformModeControler.setValue('rotate');
            break;
        case "s":
            transformControls.setMode("scale");
            transformModeControler.setValue('scale');
            break;
        case "p":
            handlePauseButton();
            break;
        case "m":
            handleAudioButton();
            break;
        case "c":
            handleScreenshotButton();
            break;
    }
});
/* END EVENTS */
/* BUTTONS - LINKS */
/* Buttons to handle scene switch */
const taskButtons = document.querySelectorAll(".task");
const description = document.querySelector("#info");
for (let i = 0; i < taskButtons.length; i++) {
    taskButtons[i].addEventListener('click', function () {
        const title = taskButtons[i].innerHTML;
        // strip the number (1. ABC -> ABC)
        description.innerHTML = title.substr(title.indexOf(' ') + 1);
        switchScene(i);
    });
}
const sourceButton = document.getElementById('source-link');
sourceButton.onclick = function () {
    window.open(sourceLink, '_blank');
};
const screenshotButton = document.querySelector('#screenshot');
screenshotButton.addEventListener('click', handleScreenshotButton, false);
function handleScreenshotButton() {
    render();
    canvas.toBlob((blob) => {
        saveBlob(blob, `screencapture-${canvas.width}x${canvas.height}.png`);
    });
    return;
}
const saveBlob = (function () {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    return function saveData(blob, fileName) {
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
    };
}());
const pauseButton = document.querySelector("#pause");
const pauseIcon = document.querySelector('#pause-icon');
pauseButton.addEventListener('click', handlePauseButton, false);
function handlePauseButton() {
    pauseIcon.classList.toggle('fa-pause');
    pauseIcon.classList.toggle('fa-play');
    pause = !pause;
    const tooltiptextElement = document.querySelector('#pause > .tooltip > .tooltiptext');
    if (pause) {
        tooltiptextElement.innerHTML = "Play (P)";
    }
    else {
        tooltiptextElement.innerHTML = "Pause (P)";
    }
}
const audioButton = document.querySelector("#audio");
const audioIcon = document.querySelector("#audio-icon");
audioButton.addEventListener('click', handleAudioButton, false);
function handleAudioButton() {
    audioIcon.classList.toggle('fas-volume-mute');
    audioIcon.classList.toggle('fa-volume-up');
    muted = !muted;
    const tooltiptextElement = document.querySelector('#audio > .tooltip > .tooltiptext');
    if (muted) {
        tooltiptextElement.innerHTML = "Unmute (M)";
    }
    else {
        tooltiptextElement.innerHTML = "Mute (M)";
    }
}
/* SIDEBAR STUFFS*/
const sidebarOpenButton = document.querySelector(".openbtn");
sidebarOpenButton.addEventListener('click', openNav, false);
const sidebarCloseButton = document.querySelector(".closebtn");
sidebarCloseButton.addEventListener('click', closeNav, false);
const sidebarElement = document.getElementById("mySidebar");
const mainElement = document.getElementById("main");
function openNav() {
    sidebarElement.style.width = "250px";
    mainElement.style.marginLeft = "250px";
    statsGUIs.forEach(stat => {
        stat.dom.style.marginLeft = "250px";
    });
}
openNav();
function closeNav() {
    sidebarElement.style.width = "0";
    mainElement.style.marginLeft = "0";
    statsGUIs.forEach(stat => {
        stat.dom.style.marginLeft = "0";
    });
}
