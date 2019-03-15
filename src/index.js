import './css/style.styl'

import './css/reset.styl'

import * as THREE from 'three'

import CameraControls from 'camera-controls'

import * as POST from 'postprocessing'
 

CameraControls.install( { THREE: THREE } );

var params = {
	size: 20,
	noiseScale: 0.10,
	noiseSpeed: 0.009,
	noiseStrength: 0.08,
	noiseFreeze: true,
	particleCount: 2000,
	particleSize: 0.06, //0.02
	particleSpeed: 0.1,
	particleDrag: 0.9,
	particleColor: 0xeb21f2, //0x41a5ff, 0xff6728, 0xeb21f2
	bgColor: 0x000000,
	particleBlending: THREE.AdditiveBlending
};



function random_color( format ){
	var rint = Math.floor( 0x00000 * Math.random());
	switch( format ){
	  case 'hex':
		return '#' + ('00000'   + rint.toString(16)).slice(-6).toUpperCase();
	  case 'hexa':
		return '#' + ('0000000' + rint.toString(16)).slice(-8).toUpperCase();
	  case 'rgb':
		return 'rgb('  + (rint & 255) + ',' + (rint >> 8 & 255) + ',' + (rint >> 16 & 255) + ')';
	  case 'rgba':
		return 'rgba(' + (rint & 255) + ',' + (rint >> 8 & 255) + ',' + (rint >> 16 & 255) + ',' + (rint >> 24 & 255)/255 + ')';
	  default:
		return rint;
	}
  }

  color = random_color()
  //params.particleColor = color

// PERLIN NOISE

// http://asserttrue.blogspot.nl/2011/12/perlin-noise-in-javascript_31.html

// This is a port of Ken Perlin's Java code. The
// original Java code is at https://cs.nyu.edu/~perlin/noise/.
// Note that in this version, a number from 0 to 1 is returned.

let PerlinNoise = new function() {

	this.noise = function(x, y, z) {
	
	   var p = new Array(512)
	   var permutation = [151,160,137,91,90,15,
			 131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
			 190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
			 88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
			 77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
			 102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
			 135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
			 5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
			 223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
			 129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
			 251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
			 49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
			 138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
	   ];
	   for (var i=0; i < 256 ; i++) 
			 p[256+i] = p[i] = permutation[i]; 
	
		  var X = Math.floor(x) & 255,                  // FIND UNIT CUBE THAT
			  Y = Math.floor(y) & 255,                  // CONTAINS POINT.
			  Z = Math.floor(z) & 255;
						x -= Math.floor(x);                       // FIND RELATIVE X,Y,Z
						y -= Math.floor(y);                       // OF POINT IN CUBE.
						z -= Math.floor(z);
		  var u = fade(x),                              // COMPUTE FADE CURVES
			  v = fade(y),                              // FOR EACH OF X,Y,Z.
			  w = fade(z);
		  var A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z, // HASH COORDINATES OF
			  B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z; // THE 8 CUBE CORNERS,
	
		  return scale(lerp(w, lerp(v, lerp(u, grad(p[AA  ], x  , y  , z   ),  // AND ADD
																						 grad(p[BA  ], x-1, y  , z   )), // BLENDED
																		 lerp(u, grad(p[AB  ], x  , y-1, z   ),  // RESULTS
																						 grad(p[BB  ], x-1, y-1, z   ))),// FROM  8
														 lerp(v, lerp(u, grad(p[AA+1], x  , y  , z-1 ),  // CORNERS
																						 grad(p[BA+1], x-1, y  , z-1 )), // OF CUBE
																		 lerp(u, grad(p[AB+1], x  , y-1, z-1 ),
																						 grad(p[BB+1], x-1, y-1, z-1 )))));
	   }
	   function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
	   function lerp( t, a, b ) { return a + t * (b - a); }
	   function grad(hash, x, y, z) {
		  var h = hash & 15;        		// CONVERT LO 4 BITS OF HASH CODE
		  var u = h<8 ? x : y,          // INTO 12 GRADIENT DIRECTIONS.
						v = h<4 ? y : h==12||h==14 ? x : z;
		  return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
	   } 
	   function scale(n) { return (1 + n)/2; 
		}
	}
	
////////////////////////////////////////////////////////////////////////////////
// Set up renderer
////////////////////////////////////////////////////////////////////////////////


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, .1, 1000);
const clock = new THREE.Clock();

const filter = document.querySelector(".filter")
var renderer = new THREE.WebGLRenderer();
filter.appendChild(renderer.domElement);

const ambientLight = new THREE.DirectionalLight(0xffffff, 2)
ambientLight.position.x = 0
ambientLight.position.y = 1
ambientLight.position.z = 1
scene.add(ambientLight)

const cameraControls = new CameraControls( camera, renderer.domElement );


const sizes = {}
sizes.width = window.innerWidth
sizes.height = window.innerHeight

renderer.setSize(sizes.width, sizes.height)




/**
 * Post processing
 */


/**
 * Resize
 */
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update
    renderer.setSize(sizes.width, sizes.height)
})


////////////////////////////////////////////////////////////////////////////////
// Particles
////////////////////////////////////////////////////////////////////////////////
var particles = [];

var pointGeometry = new THREE.Geometry();
pointGeometry.vertices.push(new THREE.Vector3(0,0,0));

var material = new THREE.PointsMaterial({
	color: 16777215,
	size: params.particleSize,
	sizeAttenuation: true,
	transparent: true,
	opacity: 1,
	blending: THREE.AdditiveBlending,
});

function Particle(x,y,z){
	this.pos = new THREE.Vector3(x,y,z);
	this.vel = new THREE.Vector3(0,0,0);
	this.acc = new THREE.Vector3(0,0,0);
	this.angle = new THREE.Euler(0,0,0);
	this.mesh = null;
	
}

Particle.prototype.init = function() {
	var point = new THREE.Points( pointGeometry, material );
	point.geometry.dynamic = true;
	point.geometry.verticesNeedUpdate = true;
	scene.add(point);
	this.mesh = point;
}

Particle.prototype.update = function() {
	this.acc.set(1,1,1);
	this.acc.applyEuler(this.angle);
	this.acc.multiplyScalar(params.noiseStrength);
	
	this.acc.clampLength(0, params.particleSpeed);
	this.vel.clampLength(0, params.particleSpeed);
	
	this.vel.add(this.acc);
	this.pos.add(this.vel);
	
	// this.acc.multiplyScalar(params.particleDrag);
	// this.vel.multiplyScalar(params.particleDrag);
	
	if(this.pos.x > params.size) this.pos.x = 0 + Math.random();
	if(this.pos.y > params.size) this.pos.y = 0 + Math.random();
	if(this.pos.z > params.size) this.pos.z = 0 + Math.random();
	if(this.pos.x < 0) this.pos.x = params.size - Math.random();
	if(this.pos.y < 0) this.pos.y = params.size - Math.random();
	if(this.pos.z < 0) this.pos.z = params.size - Math.random();

	this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
}

/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (_event) =>
{
    cursor.x = _event.clientX / sizes.width - 0.5
		cursor.y = _event.clientY / sizes.height - 0.5

})
let pastSpeed = params.particleSpeed
window.addEventListener( 'wheel', onMouseWheel, false );
function onMouseWheel( event ) {
    event.preventDefault();
    if(event.deltaY > 0 )
			params.particleSpeed = pastSpeed + Math.abs(event.deltaY/500)
		else 
		params.particleSpeed = pastSpeed * Math.abs(event.deltaY/500)
		
}
window.addEventListener('mousedown', ()=>{
	//noiseOffset += 1
	params.noiseStrength = 0
})
window.addEventListener('mouseup', ()=>{
	//noiseOffset += 1
	params.noiseStrength = 1
})

cameraControls.enabled = false


////////////////////////////////////////////////////////////////////////////////
// Rendering loop
////////////////////////////////////////////////////////////////////////////////
var frameCount = 0;
var gridIndex = 0;
var noise = 0;
var noiseOffset = Math.random()*100;
var numParticlesOffset = 0;
var p = null
let x = 0
let effect = true
function render() {
	requestAnimationFrame( render );
	const delta = clock.getDelta();
	cameraControls.update(delta);

	cameraControls.setTarget(params.size/2,params.size/2,params.size/2);
	cameraControls.setPosition(-5,-5,-5,true)
	// Update particle count


	numParticlesOffset = parseInt(params.particleCount - particles.length);
	if(numParticlesOffset > 0){
		for(var i = 0; i < numParticlesOffset; i++){
			var p = new Particle(
				Math.random()*params.size,
				Math.random()*params.size,
				Math.random()*params.size
			);
			p.init();
			particles.push(p);
		}
	} else {
		for(var i = 0; i < -numParticlesOffset; i++){
			scene.remove(particles[i].mesh);
			particles[i] = null;
   		particles.splice(i, 1);
		}
	}

	// Update particles based on their coords
	for(var i = 0; i < particles.length; i++){
		p = particles[i];
		
		noise = PerlinNoise.noise(
			p.pos.x*params.noiseScale*(1+(cursor.x)),
			p.pos.y*params.noiseScale*(1+(cursor.y)),
			p.pos.z*params.noiseScale + noiseOffset + frameCount*params.noiseSpeed
		) * Math.PI*2;
		p.angle.set(noise, noise, noise);
		p.update();
	}
	// Update params
	renderer.setClearColor(params.bgColor);
	material.color.setHex(params.particleColor);
	material.size = params.particleSize;
	material.blending = parseInt(params.particleBlending);
	if(!params.noiseFreeze) 
		frameCount += 0.5;
	
	renderer.render( scene, camera );
}
render();

