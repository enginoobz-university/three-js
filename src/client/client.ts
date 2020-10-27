import * as THREE from '/build/three.module.js'
import { Tasks } from './tasks.js'
import { OrbitControls } from '/jsm/controls/OrbitControls'
import Stats from '/jsm/libs/stats.module'
import { GUI } from '/jsm/libs/dat.gui.module'
import * as Helper from './helpers.js'

let camera: THREE.PerspectiveCamera
let currentScene: THREE.Scene
let currentSceneIndex: number = 0
const canvas: HTMLCanvasElement = document.getElementById("threejs-canvas") as HTMLCanvasElement
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true })
const gui = new GUI()
let statsGUIs: Stats[] = []
let controls: OrbitControls
let sourceLink: string

/* HELPERS */
const AXE_LENGHT: number = 5
const axesHelper: THREE.AxesHelper = new THREE.AxesHelper(AXE_LENGHT)
const GRID_SIZE: number = 10
const GRID_DIVISIONS: number = 10
const gridHelper: THREE.GridHelper = new THREE.GridHelper(GRID_SIZE, GRID_DIVISIONS)
let cameraHelper: THREE.CameraHelper

const SOURCE_LINK_BASE: string = 'https://github.com/enginoobz-university/three-js/tree/master/src/client/'
const STATS_WIDTH: string = '110%'
const STATS_HEIGHT: string = '110%'

init()
animate()

function init() {
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.z = 5
    camera.position.y = 3
    camera.position.x = 3
    cameraHelper = new THREE.CameraHelper(camera)
    cameraHelper.visible = false

    Helper.createObjectGUIFolder(gui, camera, 'Camera')

    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)

    createStatsGUI()
    // statsGUIs[0].dom.style.display = 'none'

    switchScene(1)

    createHelperGUIFolder()
}

function createHelperGUIFolder() {
    const helperFolder = gui.addFolder("Helpers")
    helperFolder.addFolder("Axes").add(axesHelper, "visible", true)
    helperFolder.addFolder("Grid").add(gridHelper, "visible", true)
    helperFolder.addFolder("Camera").add(cameraHelper, "visible", false)

    helperFolder.open()
}

function switchScene(scenceIndex: number) {
    // destroy Dat GUI for previous scene (if it exists)
    if (typeof (Array.from(Tasks)[currentSceneIndex][0].gui) !== 'undefined') {
        (Array.from(Tasks)[currentSceneIndex][0].gui as GUI).destroy()
    }
    currentSceneIndex = scenceIndex
    // create Dat GUI for current scene
    Array.from(Tasks)[currentSceneIndex][0].createDatGUI()

    currentScene = Array.from(Tasks)[currentSceneIndex][0].scene
    sourceLink = SOURCE_LINK_BASE + Array.from(Tasks)[currentSceneIndex][1]
    currentScene.add(axesHelper)
    currentScene.add(gridHelper)
    currentScene.add(cameraHelper)
}


function createStatsGUI() {
    for (let i = 0; i < 3; i++) {
        const statsGUI = Stats()
        statsGUI.showPanel(i); // 0: fps, 1: ms, 2: mb, 3+: custom
        statsGUI.dom.style.top = `${60 * i + 100}px`
        statsGUIs.push(statsGUI)
        document.body.appendChild(statsGUI.dom)

        const children = statsGUI.dom.childNodes as NodeListOf<HTMLCanvasElement>
        children.forEach(child => {
            child.style.width = STATS_WIDTH
            child.style.height = STATS_HEIGHT
        })
    }
}

function animate() {
    requestAnimationFrame(animate)
    render()
    // controls.update()
    for (let i = 0; i < statsGUIs.length; i++) {
        statsGUIs[i].update()
    }
}

function render() {
    Array.from(Tasks)[currentSceneIndex][0].render()
    renderer.render(currentScene, camera)
}

/* EVENTS */
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    // render()
}

/* Buttons to handle scene switch */
const taskButtons = document.querySelectorAll(".task")
for (let i = 0; i < taskButtons.length; i++) {
    taskButtons[i].addEventListener('click', function () {
        switchScene(i)
    })
}

const sourceButton: HTMLElement = document.getElementById('source-link')!
sourceButton.onclick = function () {
    window.open(
        sourceLink,
        '_blank'
    )
}
/* END EVENTS */
const sidebarOpenButton = document.querySelector(".openbtn")!
sidebarOpenButton.addEventListener('click', openNav, false)
const sidebarCloseButton = document.querySelector(".closebtn")!
sidebarCloseButton.addEventListener('click', closeNav, false)

const sidebarElement = document.getElementById("mySidebar")!
const mainElement = document.getElementById("main")!

function openNav() {
    sidebarElement.style.width = "250px"
    mainElement.style.marginLeft = "250px"
    statsGUIs.forEach(stat => {
        stat.dom.style.marginLeft = "250px"
    })
}

openNav()

function closeNav() {
    sidebarElement.style.width = "0";
    mainElement.style.marginLeft = "0";
    statsGUIs.forEach(stat => {
        stat.dom.style.marginLeft = "0"
    })
}