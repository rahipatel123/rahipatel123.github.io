import * as THREE from 'https://rahipatel123.github.io/libs/three/three.module.js';
import { VRButton } from 'https://rahipatel123.github.io/libs/three/jsm/VRButton.js';
import { XRControllerModelFactory } from 'https://rahipatel123.github.io/libs/three/jsm/XRControllerModelFactory.js';
import { BoxLineGeometry } from 'https://rahipatel123.github.io/libs/three/jsm/BoxLineGeometry.js';
import { Stats } from 'https://rahipatel123.github.io/libs/stats.module.js';
import { OrbitControls } from 'https://rahipatel123.github.io/libs/three/jsm/OrbitControls.js';


class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );

    this.clock = new THREE.Clock();
		this.objects = [];
		this.velocities = [];
		this.timeStep = 16.6667 // in milliseconds
		this.G = 0.2;
		this.ballMass = 1;

		this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.camera.position.set( 0, 1.6, 3 );

		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x505050 );

		this.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

        const light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 ).normalize();
		this.scene.add( light );

		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;

		container.appendChild( this.renderer.domElement );

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 1.6, 0);
        this.controls.update();

        this.stats = new Stats();
        container.appendChild( this.stats.dom );

        this.initScene();
        this.setupXR();

        window.addEventListener('resize', this.resize.bind(this) );

        this.renderer.setAnimationLoop( this.render.bind(this) );

				let timer = setInterval(this.moveSpheres.bind(this), this.timeStep);
	}

    random( min, max ){
        return Math.random() * (max-min) + min;
    }

    initScene( ){
				this.radius = 0.08;

				this.room = new THREE.LineSegments(
					new BoxLineGeometry( 6,6,6,10,10,10 ),
					new THREE.LineBasicMaterial( { color: 0x808080 } )
				);
				this.room.geometry.translate( 0, 3, 0 );
				this.scene.add( this.room );

				const geometry = new THREE.IcosahedronBufferGeometry( this.radius, 2 );

				const maxInitialVel = 4;
				// Init objects and velocities and add objects to scene
				for(let i=0; i<3; i++) {
					this.objects[i] = new THREE.Mesh( geometry, new
						THREE.MeshLambertMaterial( {
							color: Math.random() * 0xFFFFFF
						} ) );

						this.objects[i].position.x = this.random(-2, 2);
						this.objects[i].position.y = this.random(1, 5);
						this.objects[i].position.z = this.random(-2, 2);



						this.velocities[i] = [this.random(-maxInitialVel, maxInitialVel),
														this.random(-maxInitialVel, maxInitialVel),
														this.random(-maxInitialVel, maxInitialVel)];



						this.room.add( this.objects[i] )
				}


				const origin = new THREE.BoxBufferGeometry( 0.1, 0.1, 0.1);
				const cube = new THREE.Mesh( origin, new
					THREE.MeshLambertMaterial( {
						color: 'black'
					} ) );
				this.room.add( cube );


    }

    setupXR(){
				this.renderer.xr.enabled = true;
				document.body.appendChild( VRButton.createButton( this.renderer ) );
    }

    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

	render( ) {
        this.stats.update();

        this.renderer.render( this.scene, this.camera );
    }

	moveSpheres( ) {

				let forceMat = [];
				for(let i = 0; i < 3; i++) {
					let forceRow = [];
					for(let j = 0; j < 3; j++) {
						forceRow[j] = 0;

					}
					forceMat[i] = forceRow;
				}


				for(let i = 0; i < 2; i++) {
					for(let j = i + 1; j < 3; j++) {
						let distance;
						let normVec;
						[distance, normVec] = this.calcDisplacement( this.objects[i], this.objects[j] );
						let force = this.calcForce(distance);
						let invNormVec = [];
						for(let k = 0; k < 3; k++) {
							invNormVec[k] = -normVec[k]
						}
						forceMat[i][j] = [force, invNormVec];
						forceMat[j][i] = [force, normVec];

					}
				}



				for(let i = 0; i < 3; i++) {

					let delV = this.calcDelV(forceMat[i]);
					this.objects[i].position.x += this.velocities[i][0]*this.timeStep/1000 + delV[0];
					this.objects[i].position.y += this.velocities[i][1]*this.timeStep/1000 + delV[1];
					this.objects[i].position.z += this.velocities[i][2]*this.timeStep/1000 + delV[2];

					if (this.objects[i].position.x >= 3) {
						this.objects[i].position.x = 3;
						this.velocities[i][0] *= -1;
					}
					if (this.objects[i].position.x <= -3) {
						this.objects[i].position.x = -3;
						this.velocities[i][0] *= -1;
					}
					if (this.objects[i].position.y >= 6) {
						this.objects[i].position.y = 6;
						this.velocities[i][1] *= -1;
					}
					if (this.objects[i].position.y <= 0) {
						this.objects[i].position.y = 0;
						this.velocities[i][1] *= -1;
					}
					if (this.objects[i].position.z >= 3) {
						this.objects[i].position.z = 3;
						this.velocities[i][2] *= -1;
					}
					if (this.objects[i].position.z <= -3) {
						this.objects[i].position.z = -3;
						this.velocities[i][2] *= -1;
					}

				}
		}

	 	calcDisplacement( object1, object2 ) {

				let delX = object1.position.x - object2.position.x;
				let delY = object1.position.y - object2.position.y;
				let delZ = object1.position.z - object2.position.z;

				let distance = Math.sqrt( Math.pow(delX, 2) + Math.pow(delY, 2) + Math.pow(delZ, 2) );
				let normVec = [delX/distance, delY/distance, delZ/distance];

				return [ distance, normVec ];
		}

		calcForce( distance ) {
				let force = this.G/Math.pow( distance,2 );
				return force;
		}

		calcDelV( forceRow ) {
			// Takes row of forces, calculates change in velocity and outputs vector
			let delV = [0, 0, 0];
			for(let i = 0; i < 3; i++) {
				if(forceRow[i] == 0){
					continue
				}
				let scalarV = (forceRow[i][0]/this.ballMass)*(this.timeStep/1000);

				for(let j = 0; j < 3; j++){
					delV[j] += forceRow[i][1][j]*scalarV;
				}

			}
			return delV;
		}





}

export { App };
