var renderer, scene, camera, shape;
var bed = "full" //defualt to full-depth bed
var hide="none"
var friction = 0.95;
let rotationVelocity = { x: 0, y: 0 };

function removeLoadingAnimation() {
    var elementToRemove = document.getElementById('loadingDiv');
    if (elementToRemove) {
      document.body.removeChild(elementToRemove);
    } else {
    }
}

init();


function init() {


    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000, 0 )
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; 
    document.body.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set(-75,75,75);
    camera.lookAt(new THREE.Vector3(0,0,0));

    var onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    window.addEventListener( 'resize', onWindowResize, false );

}
  
// -----------------------------MATERIALS--------------------------------------------------------------------------------------------------------------------------------------

    function loadAndConfigureTexture(url, callback) {
      const loader = new THREE.TextureLoader();
      loader.load(url, (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.repeat.set(.75, .75);
        callback(texture);
      });
    }

    const textureUrls = {
      steelCortenAlbedo: "assets/textures/steelCorten/steelCorten_albedo.webp",
      steelCortenMetallic: "assets/textures/steelCorten/steelCorten_metallic.webp",
      steelCortenAO: "assets/textures/steelCorten/steelCorten_ao.webp",
      steelCortenRoughness: "assets/textures/steelCorten/steelCorten_roughness.webp",
      steelCortenNormal: "assets/textures/steelCorten/steelCorten_normal.webp",
      steelCortenHeight: "assets/textures/steelCorten/steelCorten_height.webp",
      steelStainlessBrushedAlbedo: "assets/textures/steelStainlessBrushed/steelStainlessBrushed_albedo.webp",
      steelStainlessBrushedMetallic: "assets/textures/steelStainlessBrushed/steelStainlessBrushed_metallic.webp",
      steelStainlessBrushedRoughness: "assets/textures/steelStainlessBrushed/steelStainlessBrushed_roughness.webp",
      steelStainlessBrushedNormal: "assets/textures/steelStainlessBrushed/steelStainlessBrushed_normal.webp",
      steelGalvanizedAlbedo: "assets/textures/steelGalvanized/steelGalvanized_albedo.webp",
      steelGalvanizedMetallic: "assets/textures/steelGalvanized/steelGalvanized_metallic.webp",
      steelGalvanizedRoughness: "assets/textures/steelGalvanized/steelGalvanized_roughness.webp",
      steelGalvanizedNormal: "assets/textures/steelGalvanized/steelGalvanized_normal.webp",
    };

    const textures = {}; 

    let texturesLoaded = 0; 
    const totalTextures = Object.keys(textureUrls).length; 

    Object.entries(textureUrls).forEach(([key, url]) => {
      // Append a unique timestamp to the URL to avoid caching issues
      const uniqueUrl = `${url}?v=${new Date().getTime()}`;
      loadAndConfigureTexture(uniqueUrl, (texture) => {
        textures[key] = texture;
        texturesLoaded++;
        if (texturesLoaded === totalTextures) {
            defineMaterials();
            update();
            updateModel();
            resetModelRotation();
            removeLoadingAnimation();
        }
      });
    });

  
    const loader = new THREE.TextureLoader();
    loader.load('assets/textures/env/env.webp', function(texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
    });
    
    var materials = {};
    
    //Set material to a basic default material
    var material, bodyMaterial, supportMaterial, bottomMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0,
        roughness: 1,
        transparent: true,
        opacity: 0.0
    });
    
    function defineMaterials() {
      materials.steelCorten = new THREE.MeshStandardMaterial({
        map: textures.steelCortenAlbedo,
        metalnessMap: textures.steelCortenMetallic,
        aoMap: textures.steelCortenAO,
        roughnessMap: textures.steelCortenRoughness,
        normalMap: textures.steelCortenNormal,
        displacementMap: textures.steelCortenHeight,
        metalness: .5,
        roughness: .7,
        displacementScale: 0.001,
        color: new THREE.Color(1, .75, .55)
      }),
      materials.steelStainlessBrushed = new THREE.MeshStandardMaterial({
        map: textures.steelStainlessBrushedAlbedo,
        metalnessMap: textures.steelStainlessBrushedMetallic,
        roughnessMap: textures.steelStainlessBrushedRoughness,
        normalMap: textures.steelStainlessBrushedNormal,
        metalness: .5,
        roughness: .6,
        displacementScale: 0.001,
        color: new THREE.Color(0.5, 0.5, 0.55)
      }),
      materials.steelStainlessBrushedDark = new THREE.MeshStandardMaterial({
        map: textures.steelStainlessBrushedAlbedo,
        metalnessMap: textures.steelStainlessBrushedMetallic,
        roughnessMap: textures.steelStainlessBrushedRoughness,
        normalMap: textures.steelStainlessBrushedNormal,
        metalness: .6,
        roughness: .6,
        displacementScale: 0.001,
        color: new THREE.Color(.4, .4, .5)
      }),
      materials.steelGalvanized = new THREE.MeshStandardMaterial({
        map: textures.steelGalvanizedAlbedo,
        metalnessMap: textures.steelGalvanizedMetallic,
        roughnessMap: textures.steelGalvanizedRoughness,
        normalMap: textures.steelGalvanizedNormal,
        metalness: .7,
        roughness: .7,
        displacementScale: 0.001,
        color: new THREE.Color(1.1, 1.1, 1.1)
      }),
      materials.aluminumBlack = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: .4,
        roughness: 0.9
      }),
      materials.aluminumGray = new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: .4,
        roughness: 0.9
      }),
      materials.aluminumWhite = new THREE.MeshStandardMaterial({
        color: 0xDDDDE7,
        metalness: 1.2,
        roughness: 1
      }),
      materials.aluminumTan = new THREE.MeshStandardMaterial({
        color: 0xCB6843,
        metalness: .4,
        roughness: 0.9
      }),
      materials.aluminumGreen = new THREE.MeshStandardMaterial({
        color: 0x002500,
        metalness: .4,
        roughness: 0.9
      }),
      materials.wireframeMagenta = new THREE.MeshStandardMaterial({
        color: 0xFF00FF,
        wireframe: true
      }),
      materials.wireframeYellow = new THREE.MeshStandardMaterial({
        color: 0xFFFF00,
        wireframe: true
      }),
      materials.wireframeCyan = new THREE.MeshStandardMaterial({
        color: 0x00FFFF,
        wireframe: true
      }),
      materials.aluminumCustom = new THREE.MeshNormalMaterial();
    }

    //LIGHTING

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, .5 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );

    const hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
    //cene.add( hemiLightHelper );


    const dirLight = new THREE.DirectionalLight( 0xffffff, 2.3 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( 1, 1.75, 1 );
    dirLight.position.multiplyScalar( 30 );
    dirLight.far = 400;
    scene.add( dirLight );
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    const d = 100;
    dirLight.shadow.camera.left = - d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = - d;
    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = - 0.0001;

    const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
    //scene.add( dirLightHelper );


    const dirLight2 = new THREE.DirectionalLight( 0xffffff, .7 );
    dirLight2.color.setHSL( 0.1, 1, 0.95 );
    dirLight2.position.set( 100, -10, -40 );
    dirLight2.far = 400;
    scene.add( dirLight2 );
    dirLight2.castShadow = true;
    dirLight2.shadow.mapSize.width = 2048;
    dirLight2.shadow.mapSize.height = 2048;
    dirLight2.shadow.camera.left = - d;
    dirLight2.shadow.camera.right = d;
    dirLight2.shadow.camera.top = d;
    dirLight2.shadow.camera.bottom = - d;
    dirLight2.shadow.camera.far = 3500;
    dirLight2.shadow.bias = - 0.0001;

    const dirLightHelper2 = new THREE.DirectionalLightHelper( dirLight2, 10 );
    //scene.add( dirLightHelper2 );

    const dirLight3 = new THREE.DirectionalLight( 0xffffff, .5 );
    dirLight3.color.setHSL( 0.095, 1, 0.75 );
    dirLight3.position.set( -1.25, -1.75, 1.25 );
    dirLight3.position.multiplyScalar( 30 );
    dirLight3.far = 400;
    scene.add( dirLight3 );
    dirLight3.castShadow = true;
    dirLight3.shadow.mapSize.width = 2048;
    dirLight3.shadow.mapSize.height = 2048;
    dirLight3.shadow.camera.left = - d;
    dirLight3.shadow.camera.right = d;
    dirLight3.shadow.camera.top = d;
    dirLight3.shadow.camera.bottom = - d;
    dirLight3.shadow.camera.far = 3500;
    dirLight3.shadow.bias = - 0.0001;

    const dirLightHelper3 = new THREE.DirectionalLightHelper( dirLight3, 10 );
    //scene.add( dirLightHelper3 );


  

    var length = 72;
    var width = 30;
    var height = 24;
    var thickness = .074;
    var miterWidth=1.5
    var insideWallHeight = 2
    var latSuppH = 1
    var latSuppW = 1
    var crossbeamH = 1
    var crossbeamW = 1
    var bedThickness = .1
    var bedMargin = .313 //The bed is held back .313" around the perimeter to allow for draining
    var latSuppTopVoffset = 4 //Top lateral supports placed 4" down from top edge
    var lowBedOffset = .074
    const boxGroup = new THREE.Group();
    var maxDimension = Math.max(width, height, length);
    var showwireframe = "false"

    function updateModel() {
        removeLoadingAnimation();

      while (boxGroup.children.length > 0) {
        let child = boxGroup.children[0];
        boxGroup.remove(child);

        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      }
      

      if (showwireframe == "true"){
        var bottomMaterial = materials.wireframeYellow
        var supportMaterial = materials.wireframeCyan
        var bodyMaterial = materials.wireframeMagenta
      } else {
        var bodyMaterial = material
        var bottomMaterial = materials.steelGalvanized
        var supportMaterial = materials.steelStainlessBrushedDark
      }

      // ------------SHAPE BUILDERS-------------------------------------------------------------------------------------------------------------------------------------------------------------
      
      function createWall(
        material,
        wallWidth,
        wallHeight,
        wallDepth,
        wallPosition,
        wallRotation
      ) {
        const geometry = new THREE.BoxGeometry(
          wallWidth,
          wallHeight,
          wallDepth
        );

        const baseUnitSize = 30;


        const uvScaleX = wallWidth / baseUnitSize; 
        const uvScaleY = wallHeight / baseUnitSize;


        const uvs = geometry.attributes.uv.array;
        for (let i = 0; i < uvs.length; i += 2) {
          uvs[i] *= uvScaleX; 
          uvs[i + 1] *= uvScaleY; 
        }
        geometry.attributes.uv.needsUpdate = true;

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(wallPosition.x, wallPosition.y, wallPosition.z);
        mesh.rotation.set(wallRotation.x, wallRotation.y, wallRotation.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        boxGroup.add(mesh);
      }
      
      function createTrapezoid(material, tzLength, tzHeight, tzThickness, tzPosition, tzRotation) {
          const shape = new THREE.Shape();
          const bottomWidth = tzLength;
          const topWidth = tzLength - tzHeight * 2;
          const height = tzHeight;
          shape.moveTo(-(tzLength / 2), 0); // Bottom left
          shape.lineTo(tzLength / 2, 0); // Bottom right
          shape.lineTo((topWidth) / 2, height); // Top right
          shape.lineTo(-(topWidth) / 2, height); // Top left
          shape.lineTo(-(tzLength / 2), 0); // Close the path

          const extrudeSettings = {
              steps: 1,
              depth: tzThickness, 
              bevelEnabled: false, 
          };

          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          geometry.center();

          const clonedMaterial = material.clone();
          if (clonedMaterial.map) {
              clonedMaterial.map = clonedMaterial.map.clone();
              clonedMaterial.map.repeat.set(.025, .025);
              clonedMaterial.map.needsUpdate = true;
          }

          const mesh = new THREE.Mesh(geometry, clonedMaterial);
          mesh.position.set(tzPosition.x, tzPosition.y, tzPosition.z);
          mesh.rotation.set(tzRotation.x, tzRotation.y, tzRotation.z);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          boxGroup.add(mesh);
      }

      //ADD TO SCENE
      boxGroup.name = 'boxGroupObject';
      scene.add(boxGroup);
      
      // ------------MODEL CONSTRUCTION-------------------------------------------------------------------------------------------------------------------------------------------------------------
      
      if (shape === "type2"){
        latSuppH = .25
        latSuppW = 2
        lowBedOffset = .25
      } else {
        latSuppH = 1
        latSuppW = 1
        lowBedOffset = .074
      }


      // OUTSIDE WALLS
      // Rear wall
      createWall(
        bodyMaterial,
        length,
        height,
        thickness,
        { x: 0, y: 0, z: -width / 2 + thickness / 2},
        { x: 0, y: 0, z: 0 }
      );
      
      // Front wall
      if (hide !== "front"){ //Hide front for cutaway view
        createWall(
          bodyMaterial,
          length,
          height,
          thickness,
          { x: 0, y: 0, z: width / 2 - thickness / 2},
          { x: 0, y: 0, z: 0 }
        );
      }

      // Right wall
      createWall(
        bodyMaterial,
        width - thickness * 2,
        height,
        thickness,
        { x: length / 2 - thickness / 2, y: 0, z: 0 },
        { x: 0, y: (90 * Math.PI) / 180, z: 0 }
      );
      
      // Left wall
      createWall(
        bodyMaterial,
        width - thickness * 2,
        height,
        thickness,
        { x: -length / 2 + thickness / 2, y: 0, z: 0 },
        { x: 0, y: (90 * Math.PI) / 180, z: 0 }
      );
      
      if (shape ==="type1"){
        //FOR TYPE 1 BEND THE WALLS IN AT THE TOP WITH MITER JOINTS
        //Rear
        createTrapezoid(
          bodyMaterial,
          length,
          miterWidth,
          thickness,
          { x: 0, y: height / 2 - thickness / 2 + .01, z: - (width / 2 - miterWidth / 2 - .01)}, //Position
          { x: (90 * Math.PI) / 180, y: 0, z: 0} //Rotation
        );
        
        //Front
        if (hide !== "front"){ //Hide front for cutaway view
          createTrapezoid(
            bodyMaterial,
            length,
            miterWidth,
            thickness,
            { x: 0, y: height / 2 - thickness / 2 + .01, z: + (width / 2 - miterWidth / 2 - .01)}, //Position
            { x: (90 * Math.PI) / 180, y: 0, z: (180 * Math.PI) / 180} //Rotation
          );
        }

        //Left
        createTrapezoid(
          bodyMaterial,
          width,
          miterWidth,
          thickness,
          { x: - (length / 2 - miterWidth / 2 - .01), y: height / 2 - thickness / 2 + .01, z: 0}, //Position
          { x: (90 * Math.PI) / 180, y: 0, z: (270 * Math.PI) / 180} //Rotation
        );
        
        //Right
        createTrapezoid(
          bodyMaterial,
          width,
          miterWidth,
          thickness,
          { x: + (length / 2 - miterWidth / 2 - .01), y: height / 2 - thickness / 2 + .01, z: 0}, //Position
          { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180} //Rotation
        );
      }
      if (shape === "type3"){
        //FOR TYPE 3 (ALUMINUM) bend the walls in at the top but no miters
        // Rear 
        createWall(
          bodyMaterial,
          length - thickness,
          miterWidth,
          thickness,
          { x: 0, y: height / 2 - thickness / 2, z: -width / 2 + (miterWidth / 2) + thickness / 2},
          { x: (90 * Math.PI) / 180, y: 0, z: 0 }
        );
        
        // Front 
        if (hide !== "front"){ //Hide front for cutaway view
          createWall(
            bodyMaterial,
            length - thickness,
            miterWidth,
            thickness,
            { x: 0, y: height / 2 - thickness / 2, z: width / 2 - (miterWidth / 2) - thickness / 2},
            { x: (90 * Math.PI) / 180, y: 0, z: 0 }
          );
        }
        
        // Right 
        createWall(
          bodyMaterial,
          width - miterWidth * 2 - thickness,
          miterWidth,
          thickness,
          { x: length / 2 - (miterWidth / 2) - thickness / 2, y: height / 2 - thickness / 2, z: 0},
          { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180 }
        );
        
        // Left 
        createWall(
          bodyMaterial,
          width - miterWidth * 2 - thickness,
          miterWidth,
          thickness,
          { x: -length / 2 + (miterWidth / 2) + thickness / 2, y: height / 2 - thickness / 2, z: 0},
          { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180 }
        );
      }
      if (shape === "type1" || shape === "type3"){
        //INSIDE WALLS FOR TYPE 1 AND TYPE 2
        //Rear
        createWall(
          bodyMaterial,
          length - miterWidth * 2,
          insideWallHeight,
          thickness,
          { x: 0, y: height / 2 - insideWallHeight / 2, z: -width / 2 + thickness / 2 + miterWidth},
          { x: 0, y: 0, z: 0 }
        );

        //Front
        if (hide !== "front"){ //Hide front for cutaway view
          createWall(
            bodyMaterial,
            length - miterWidth * 2,
            insideWallHeight,
            thickness,
            { x: 0, y: height / 2 - insideWallHeight / 2, z: width / 2 - thickness / 2 - miterWidth},
            { x: 0, y: 0, z: 0 }
          );
        }

        // Right
        createWall(
          bodyMaterial,
          width - miterWidth * 2,
          insideWallHeight,
          thickness,
          { x: length / 2 - thickness / 2 - miterWidth, y: height / 2 - insideWallHeight / 2, z: 0 },
          { x: 0, y: (90 * Math.PI) / 180, z: 0 }
        );

        // Left
        createWall(
          bodyMaterial,
          width - miterWidth * 2,
          insideWallHeight,
          thickness,
          { x: - length / 2 + thickness / 2 + miterWidth, y: height / 2 - insideWallHeight / 2, z: 0 },
          { x: 0, y: (90 * Math.PI) / 180, z: 0 }
        );
      }


      //TOP LATERAL SUPPORTS
      // Rear 
      createWall(
        supportMaterial,
        length - thickness,
        latSuppW,
        latSuppH,
        { x: 0, y: height / 2 - latSuppTopVoffset - latSuppH / 2, z: -width / 2 + (latSuppW / 2) + thickness / 2},
        { x: (90 * Math.PI) / 180, y: 0, z: 0 }
      );
      
      // Front 
      createWall(
        supportMaterial,
        length - thickness,
        latSuppW,
        latSuppH,
        { x: 0, y: height / 2 - latSuppTopVoffset - latSuppH / 2, z: width / 2 - (latSuppW / 2) - thickness / 2},
        { x: (90 * Math.PI) / 180, y: 0, z: 0 }
      );
      
      // Right 
      createWall(
        supportMaterial,
        width - latSuppW * 2 - thickness,
        latSuppW,
        latSuppH,
        { x: length / 2 - (latSuppW / 2) - thickness / 2, y: height / 2 - latSuppTopVoffset - latSuppH / 2, z: 0},
        { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180 }
      );
      
      // Left 
      createWall(
        supportMaterial,
        width - latSuppW * 2 - thickness,
        latSuppW,
        latSuppH,
        { x: -length / 2 + (latSuppW / 2) + thickness / 2, y: height / 2 - latSuppTopVoffset - latSuppH / 2, z: 0},
        { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180 }
      );


      // MID LATERAL SUPPORTS
      if (shape === "type1" && height > 20 || shape === "type2" && height > 24 || shape === "type3" && height > 16){
        //If height is sufficient, add the mid lateral supports right at the mid point
        // Rear 
        createWall(
          supportMaterial,
          length - thickness,
          latSuppW,
          latSuppH,
          { x: 0, y: 0, z: -width / 2 + (latSuppW / 2) + thickness / 2},
          { x: (90 * Math.PI) / 180, y: 0, z: 0 }
        );
        
        // Front 
        createWall(
          supportMaterial,
          length - thickness,
          latSuppW,
          latSuppH,
          { x: 0, y: 0, z: width / 2 - (latSuppW / 2) - thickness / 2},
          { x: (90 * Math.PI) / 180, y: 0, z: 0 }
        );
        
        // Right 
        createWall(
          supportMaterial,
          width - latSuppW * 2 - thickness,
          latSuppW,
          latSuppH,
          { x: length / 2 - (latSuppW / 2) - thickness / 2, y: 0, z: 0},
          { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180 }
        );
        
        // Left 
        createWall(
          supportMaterial,
          width - latSuppW * 2 - thickness,
          latSuppW,
          latSuppH,
          { x: -length / 2 + (latSuppW / 2) + thickness / 2, y: 0, z: 0},
          { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180 }
        );


        if (bed == "mid"){
            //If mid-depth bed is selected, draw cross supports and bed on top of the middle lateral supports
            createWall(
              bottomMaterial,
              length - bedMargin * 2,
              width - bedMargin * 2,
              bedThickness,
              { x: 0, y: latSuppH / 2 + crossbeamH + bedThickness / 2, z: 0 },
              { x: (90 * Math.PI) / 180, y: 0, z: 0 }
            )
            
            //Create crossbeams at the midpoint
            var crossbeamqty=Math.floor(length/12)
            for(let i = 0; i < crossbeamqty; i++) {

              createWall(
                supportMaterial,
                width - thickness * 2,
                crossbeamW,
                crossbeamH,
                { x: -length / 2 + ((length - crossbeamqty * 12)/2) + i * 12 + 6, y: latSuppH / 2 + crossbeamH / 2, z: 0},
                { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180 }
              );
            }
          }

      } else if (bed === "mid"){
        //If height is insufficient but mid-depth bed is selected, add the mid lateral supports at a lower offset to accomodate a perfectly mid-depth bed
        // Rear 
        createWall(
          supportMaterial,
          length - thickness,
          latSuppW,
          latSuppH,
          { x: 0, y: -latSuppH / 2 - crossbeamH - bedThickness / 2, z: -width / 2 + (latSuppW / 2) + thickness / 2},
          { x: (90 * Math.PI) / 180, y: 0, z: 0 }
        );
        
        // Front 
        createWall(
          supportMaterial,
          length - thickness,
          latSuppW,
          latSuppH,
          { x: 0, y: -latSuppH / 2 - crossbeamH - bedThickness / 2, z: width / 2 - (latSuppW / 2) - thickness / 2},
          { x: (90 * Math.PI) / 180, y: 0, z: 0 }
        );
        
        // Right 
        createWall(
          supportMaterial,
          width - latSuppW * 2 - thickness,
          latSuppW,
          latSuppH,
          { x: length / 2 - (latSuppW / 2) - thickness / 2, y: -latSuppH / 2 - crossbeamH - bedThickness / 2, z: 0},
          { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180 }
        );
        
        // Left 
        createWall(
          supportMaterial,
          width - latSuppW * 2 - thickness,
          latSuppW,
          latSuppH,
          { x: -length / 2 + (latSuppW / 2) + thickness / 2, y: -latSuppH / 2 - crossbeamH - bedThickness / 2, z: 0},
          { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180 }
        );     

        //Draw the bed perfectly centered, with the cross supports sandwitched between the bed and the lateral supports
        createWall(
          bottomMaterial,
          length - bedMargin * 2,
          width - bedMargin * 2,
          bedThickness,
          { x: 0, y: 0, z: 0 }, //Perfectly centered bed
          { x: (90 * Math.PI) / 180, y: 0, z: 0 }
        )
        
        //Create crossbeams sandwitched between the bed and the lateral supports
        var crossbeamqty=Math.floor(length/12)
        for(let i = 0; i < crossbeamqty; i++) {

          createWall(
            supportMaterial,
            width - thickness * 2,
            crossbeamW,
            crossbeamH,
            { x: -length / 2 + ((length - crossbeamqty * 12)/2) + i * 12 + 6, y: - bedThickness / 2 - crossbeamH / 2, z: 0},
            { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180 }
          );
        }     
      }
    

      //BOTTOM

      if (shape === "type1"){
        //FOR TYPE 1 (14 GA CORTEN & STAINLESS) bend the walls in with miter cuts
        //Rear
        createTrapezoid(
          bodyMaterial,
          length,
          miterWidth,
          thickness,
          { x: 0, y: -height / 2 + thickness / 2 + .01, z: - (width / 2 - miterWidth / 2 - .01)}, //Position
          { x: (90 * Math.PI) / 180, y: 0, z: 0} //Rotation
        );
        
        //Front
        if (hide !== "front"){ //Hide front for cutaway view
          createTrapezoid(
            bodyMaterial,
            length,
            miterWidth,
            thickness,
            { x: 0, y: -height / 2 + thickness / 2 + .01, z: + (width / 2 - miterWidth / 2 - .01)}, //Position
            { x: (90 * Math.PI) / 180, y: 0, z: (180 * Math.PI) / 180} //Rotation
          );
        }
        
        //Left
        createTrapezoid(
          bodyMaterial,
          width,
          miterWidth,
          thickness,
          { x: - (length / 2 - miterWidth / 2 - .01), y: -height / 2 + thickness / 2 + .01, z: 0}, //Position
          { x: (90 * Math.PI) / 180, y: 0, z: (270 * Math.PI) / 180} //Rotation
        );
        
        //Right
        createTrapezoid(
          bodyMaterial,
          width,
          miterWidth,
          thickness,
          { x: + (length / 2 - miterWidth / 2 - .01), y: -height / 2 + thickness / 2 + .01, z: 0}, //Position
          { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180} //Rotation
        );
      }
      if (shape === "type2"){
        //FOR TYPE 2 (7 GA CORTEN) use lateral supports for the bottom instead of bending the walls in
        // Rear 
        createWall(
          supportMaterial,
          length - thickness,
          latSuppW,
          latSuppH,
          { x: 0, y: -height / 2 + latSuppH / 2, z: -width / 2 + (latSuppW / 2) + thickness / 2},
          { x: (90 * Math.PI) / 180, y: 0, z: 0 }
        );
        
        // Front 
        createWall(
          supportMaterial,
          length - thickness,
          latSuppW,
          latSuppH,
          { x: 0, y: -height / 2 + latSuppH / 2, z: width / 2 - (latSuppW / 2) - thickness / 2},
          { x: (90 * Math.PI) / 180, y: 0, z: 0 }
        );
        
        // Right 
        createWall(
          supportMaterial,
          width - latSuppW * 2 - thickness,
          latSuppW,
          latSuppH,
          { x: length / 2 - (latSuppW / 2) - thickness / 2, y: -height / 2 + latSuppH / 2, z: 0},
          { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180 }
        );
        
        // Left 
        createWall(
          supportMaterial,
          width - latSuppW * 2 - thickness,
          latSuppW,
          latSuppH,
          { x: -length / 2 + (latSuppW / 2) + thickness / 2, y: -height / 2 + latSuppH / 2, z: 0},
          { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180 }
        );
      }
      if (shape === "type3"){
        //FOR TYPE 3 (ALUMINUM) bend the walls in at the bottom but no miters
        // Rear 
        createWall(
          bodyMaterial,
          length - thickness,
          miterWidth,
          thickness,
          { x: 0, y: -height / 2 + thickness / 2, z: -width / 2 + (miterWidth / 2) + thickness / 2},
          { x: (90 * Math.PI) / 180, y: 0, z: 0 }
        );
        
        // Front 
        if (hide !== "front"){ //Hide front for cutaway view
          createWall(
            bodyMaterial,
            length - thickness,
            miterWidth,
            thickness,
            { x: 0, y: -height / 2 + thickness / 2, z: width / 2 - (miterWidth / 2) - thickness / 2},
            { x: (90 * Math.PI) / 180, y: 0, z: 0 }
          );
        }
        
        // Right 
        createWall(
          bodyMaterial,
          width - miterWidth * 2 - thickness,
          miterWidth,
          thickness,
          { x: length / 2 - (miterWidth / 2) - thickness / 2, y: -height / 2 + thickness / 2, z: 0},
          { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180 }
        );
        
        // Left 
        createWall(
          bodyMaterial,
          width - miterWidth * 2 - thickness,
          miterWidth,
          thickness,
          { x: -length / 2 + (miterWidth / 2) + thickness / 2, y: -height / 2 + thickness / 2, z: 0},
          { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180 }
        );
      }
      
      // BED & CROSS SUPPORTS
      // Conditional logic based on bed height selection
      if (bed === "full"){
        //Create the bed offset by the height of the lateral supports and crossbeams
        createWall(
          bottomMaterial,
          length - bedMargin * 2,
          width - bedMargin * 2,
          bedThickness,
          { x: 0, y: -height / 2 + lowBedOffset + crossbeamH + bedThickness / 2, z: 0 },
          { x: (90 * Math.PI) / 180, y: 0, z: 0 }
        )
        
        //Create crossbeams offset by the lateral supports
        var crossbeamqty=Math.floor(length/12)
        for(let i = 0; i < crossbeamqty; i++) {

          createWall(
            supportMaterial,
            width - thickness * 2,
            crossbeamW,
            crossbeamH,
            { x: -length / 2 + ((length - crossbeamqty * 12)/2) + i * 12 + 6, y: -height / 2 + lowBedOffset + crossbeamH / 2, z: 0},
            { x: (90 * Math.PI) / 180, y: 0, z: (90 * Math.PI) / 180 }
          );

        }
      }

      // CAMERA POSITION
      maxDimension = Math.max(width, height, length);
      camera.position.set(0, 0, maxDimension * 2);
      camera.lookAt(scene.position);
    }
  

  
// ------------USER CONTROLS-------------------------------------------------------------------------------------------------------------------------------------------------------------
let isDragging = false;
let previousMousePosition = {
    x: 0,
    y: 0
};
let inactivityTimeout;
const defaultRotation = { x: 22* (Math.PI/180), y: 45* (Math.PI/180), z: 0 }; 
const returnSpeed = 0.1; 


function resetModelRotation() {

    const object = scene.getObjectByName('boxGroupObject');
    if (!object) return;

    const dx = defaultRotation.x - object.rotation.x;
    const dy = defaultRotation.y - object.rotation.y;
    const dz = defaultRotation.z - object.rotation.z;


    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01 && Math.abs(dz) < 0.01) {
        object.rotation.x = defaultRotation.x;
        object.rotation.y = defaultRotation.y;
        object.rotation.z = defaultRotation.z;
        rotationVelocity.x = 0;
        rotationVelocity.y = 0;
        return; 
    }

    object.rotation.x += dx * returnSpeed;
    object.rotation.y += dy * returnSpeed;
    object.rotation.z += dz * returnSpeed;


    requestAnimationFrame(resetModelRotation);
}




function restartInactivityTimeout() {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
        resetModelRotation(); 
    }, 5000);
}

function initialRotationTimer() {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
        resetModelRotation(); 
    }, 50);
}


const onDocumentMouseDown = (event) => {
    document.body.style.cursor = 'grabbing';
    isDragging = true;
    restartInactivityTimeout();

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
};


const onDocumentMouseMove = (event) => {
  if (isDragging) {
      restartInactivityTimeout();
      const currentMousePosition = { x: event.clientX, y: event.clientY };
      const deltaMove = {
          x: currentMousePosition.x - previousMousePosition.x,
          y: currentMousePosition.y - previousMousePosition.y,
      };

      const rotateSpeed = 0.001;
      rotationVelocity.y += deltaMove.x * rotateSpeed;
      rotationVelocity.x += deltaMove.y * rotateSpeed;

      previousMousePosition = { ...currentMousePosition };
  }
};


const onDocumentMouseUp = () => {
    document.body.style.cursor = 'grab';
    isDragging = false;
    restartInactivityTimeout();
};
  
const onDocumentTouchStart = (event) => {
  if (event.touches.length > 0) { 
      isDragging = true;
      restartInactivityTimeout();

      previousMousePosition = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
      };
      event.preventDefault(); 
  }
};

const onDocumentTouchMove = (event) => {
  if (isDragging && event.touches.length > 0) {
      restartInactivityTimeout();
      const currentTouchPosition = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
      };
      const deltaMove = {
          x: currentTouchPosition.x - previousMousePosition.x,
          y: currentTouchPosition.y - previousMousePosition.y
      };

      const rotateSpeed = 0.002;
      rotationVelocity.y += deltaMove.x * rotateSpeed;
      rotationVelocity.x += deltaMove.y * rotateSpeed;

      previousMousePosition = { ...currentTouchPosition };
      event.preventDefault(); 
  }
};

const onDocumentTouchEnd = () => {
  isDragging = false;
  restartInactivityTimeout();
};

window.addEventListener('mousedown', onDocumentMouseDown, false);
window.addEventListener('mousemove', onDocumentMouseMove, false);
window.addEventListener('mouseup', onDocumentMouseUp, false);
window.addEventListener('touchstart', onDocumentTouchStart, { passive: false });
window.addEventListener('touchmove', onDocumentTouchMove, { passive: false });
window.addEventListener('touchend', onDocumentTouchEnd, false);

initialRotationTimer();

// ------------MAIN ANIMATION LOOP-------------------------------------------------------------------------------------------------------------------------------------------------------------
function update() {
  requestAnimationFrame(update);

  const object = scene.getObjectByName('boxGroupObject');
  if (object) {
      object.rotation.y += rotationVelocity.y;
      object.rotation.x += rotationVelocity.x;
      if ( object.rotation.x == 0 && object.rotation.y == 0 && object.rotation.z == 0 ){
          resetModelRotation();
      }
  }


  friction = .9;
  rotationVelocity.x *= friction;
  rotationVelocity.y *= friction;


  if (Math.abs(rotationVelocity.x) < 0.0002) rotationVelocity.x = 0;
  if (Math.abs(rotationVelocity.y) < 0.0002) rotationVelocity.y = 0;

  renderer.render(scene, camera);
}


// ------------POSTMESSAGE COMMUNICATION-------------------------------------------------------------------------------------------------------------------------------------------------------------
window.addEventListener(
  "message",
  function (event) {
    if (event.data.width) {
      width = event.data.width;
    }
    if (event.data.length) {
      length = event.data.length;
    }
    if (event.data.height) {
      height = event.data.height;
    }
    if (event.data.thickness) {
      thickness = event.data.thickness;
    }
    if (event.data.material) {
      var newMaterial = event.data.material;
      material = materials[newMaterial];
    }
    if (event.data.bed) {
      bed = event.data.bed;
    }
    if (event.data.shape) {
      shape = event.data.shape;
    }
    if (event.data.hide) {
      hide = event.data.hide;
    }
    if (event.data.wireframe) {
      showwireframe = event.data.wireframe;
    }
    boxGroup.children.forEach((child) => {
      child.material = material;
    });
    updateModel();
  },
  false
);
