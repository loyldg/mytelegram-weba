import{Dp as e,E as t,El as n,Ep as r,Ga as i,Op as a,Tc as o,V as s,Z as c,al as l,eo as u,k as d,n as f,no as p,r as m,rl as h,w as g,yp as _}from"./InputText-gQuIJmDO.js";import{Qt as v,r as y,t as b}from"./fasterdom-CmMm9KRK.js";import{S as x,_ as S,b as C,h as w,u as T,v as E,y as D}from"./teact-BNKrQQdN.js";import{ot as O,u as k}from"./colors-DmjIiD2H.js";import{h as ee}from"./usePrevious-CQaNan8z.js";import{m as te}from"./PickerItem-BkK6Gipk.js";import{K as ne,L as A,R as j,r as M}from"./Checkbox-Cz3nXtwt.js";import{n as N}from"./animatedAssets-Ba9SA8Dx.js";import{r as P}from"./stars-DgMPUC2H.js";import{r as re}from"./animation-BA0CtVmx.js";import{t as F}from"./Modal-CBGUntCe.js";import{r as I}from"./Skeleton-CfKgFRwA.js";import{J as ie,Nt as ae,W as oe,kt as se}from"./ActionMessage-CgD0Cmg8.js";var ce=T(({ref:r,id:i,className:o,value:s,label:c,error:u,success:d,disabled:p,readOnly:m,placeholder:h,autoComplete:g,inputMode:_,maxLength:x,maxLengthIndicator:S,hasLengthIndicator:T,tabIndex:D,onChange:O,onInput:k,onKeyPress:ee,onKeyDown:te,onBlur:ne,onPaste:A,noReplaceNewlines:j})=>{let M=C();r&&(M=r);let N=t(),P=u||d||c,re=n(`input-group`,s&&`touched`,u?`error`:d&&`success`,p&&`disabled`,m&&`disabled`,P&&`with-label`,o),F=l(e=>{y(()=>{e.style.height=`0`,b(()=>{let t=e.scrollHeight;return()=>{e.style.height=`${t}px`}})})});E(()=>{let e=M.current;e&&F(e)},[]);let I=w(e=>{let t=e.currentTarget;if(!j){let e=t.selectionEnd;t.value=t.value.replace(/\n/g,` `),t.selectionEnd=e}F(t),O?.(e)},[j,O]);return a(`div`,{className:re,dir:N.isRtl?`rtl`:void 0,children:[e(`textarea`,{ref:M,className:`form-control`,id:i,dir:`auto`,value:s||``,tabIndex:D,placeholder:h,maxLength:x,autoComplete:g,spellCheck:!v&&void 0,inputMode:_,disabled:p,readOnly:m,onChange:I,onInput:k,onKeyPress:ee,onKeyDown:te,onBlur:ne,onPaste:A,"aria-label":P}),P&&e(`label`,{htmlFor:i,children:P}),(S||T&&x!==void 0)&&e(`div`,{className:`max-length-indicator`,children:e(f,{text:S||Math.max(0,x-(s||``).length).toString()})})]})}),L={root:`Kdv89j1l`,top:`_0EdTY2mJ`,badge:`TvB5YSlK`,text:`lZY9nXge`},le=T(({peer:t,avatarWebPhoto:r,avatarSize:i,text:o,badgeText:s,badgeIcon:c,className:l,badgeClassName:u,badgeIconClassName:d,textClassName:f,onClick:m})=>{let h=g();return a(`div`,{className:n(L.root,m&&L.clickable,l),onClick:m,children:[a(`div`,{className:L.top,children:[e(M,{size:i,peer:t,webPhoto:r}),s&&a(`div`,{className:n(L.badge,u),dir:h.isRtl?`rtl`:`ltr`,children:[c&&e(p,{name:c,className:d}),s]})]}),o&&e(`p`,{className:n(L.text,f),children:o})]})}),ue=new k(`#0098EA`),de={blue:ue,blueGradient:[new k(`#0158AF`),new k(`#67D0FF`)],purple:new k(`#966FFE`),purpleGradient:[new k(`#6B93FF`),new k(`#E46ACE`)],gold:new k(`#FFBF0A`),goldGradient:[new k(`#FDEB32`),new k(`#D75902`)]},fe={particleCount:5,distanceLimit:1,fadeInTime:.05,minLifetime:3,maxLifetime:3,maxStartTimeDelay:0,selfDestroyTime:3,minSpawnRadius:5,maxSpawnRadius:50},R={width:350,height:230,particleCount:100,color:ue,speed:18,baseSize:6,minSpawnRadius:35,maxSpawnRadius:70,distanceLimit:.7,fadeInTime:.25,fadeOutTime:1,minLifetime:4,maxLifetime:6,maxStartTimeDelay:3,edgeFadeZone:50,centerShift:[0,0],accelerationFactor:3,selfDestroyTime:0},pe=.67,me=1.33,he=2.2,z=new Map;function B(e,t){let n=z.get(e);return n||(n=ge(e),z.set(e,n)),n.addSystem(t)}function ge(e){let t=e.getContext(`webgl`,{alpha:!0,antialias:!1,preserveDrawingBuffer:!1});if(!t)throw Error(`WebGL not supported`);let n=V(t,t.VERTEX_SHADER,_e),r=V(t,t.FRAGMENT_SHADER,ve);if(!n||!r)throw Error(`Failed to create shaders`);let i=ye(t,n,r);if(!i)throw Error(`Failed to create shader program`);let a=window.devicePixelRatio||1,o=new Map,s={attributes:{startPosition:t.getAttribLocation(i,`a_startPosition`),velocity:t.getAttribLocation(i,`a_velocity`),startTime:t.getAttribLocation(i,`a_startTime`),lifetime:t.getAttribLocation(i,`a_lifetime`),size:t.getAttribLocation(i,`a_size`),baseOpacity:t.getAttribLocation(i,`a_baseOpacity`),color:t.getAttribLocation(i,`a_color`)},uniforms:{resolution:t.getUniformLocation(i,`u_resolution`),time:t.getUniformLocation(i,`u_time`),canvasWidth:t.getUniformLocation(i,`u_canvasWidth`),canvasHeight:t.getUniformLocation(i,`u_canvasHeight`),accelerationFactor:t.getUniformLocation(i,`u_accelerationFactor`),fadeInTime:t.getUniformLocation(i,`u_fadeInTime`),fadeOutTime:t.getUniformLocation(i,`u_fadeOutTime`),edgeFadeZone:t.getUniformLocation(i,`u_edgeFadeZone`),rotationMatrices:t.getUniformLocation(i,`u_rotationMatrices`),spawnCenter:t.getUniformLocation(i,`u_spawnCenter`)}},c,l;function u(e){let n=new be(e.seed),{config:r}=e,i=new Float32Array(r.particleCount*2),o=new Float32Array(r.particleCount*2),s=new Float32Array(r.particleCount),c=new Float32Array(r.particleCount),l=new Float32Array(r.particleCount),u=new Float32Array(r.particleCount),d=new Float32Array(r.particleCount*3);for(let t=0;t<r.particleCount;t++){let f=n.next()*Math.PI*2,p=n.nextBetween(r.minSpawnRadius,r.maxSpawnRadius),m=Math.cos(f),h=Math.sin(f),g=e.centerX+m*p,_=e.centerY+h*p;i[t*2]=g*a,i[t*2+1]=_*a,c[t]=n.nextBetween(r.minLifetime,r.maxLifetime),s[t]=n.next()*r.maxStartTimeDelay;let v=n.nextBetween(e.avgDistance*r.distanceLimit*.5,e.avgDistance*r.distanceLimit)/c[t]*a;o[t*2]=m*v,o[t*2+1]=h*v;let y=n.next();y<.3?l[t]=r.baseSize*pe*a:y<.7?l[t]=r.baseSize*me*a:l[t]=r.baseSize*he*a,u[t]=n.nextBetween(.3,.8);let[b,x,S]=Se(r.color,n).coords;d[t*3]=b||0,d[t*3+1]=x||0,d[t*3+2]=S||0}t.bindBuffer(t.ARRAY_BUFFER,e.buffers.startPosition),t.bufferData(t.ARRAY_BUFFER,i,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.velocity),t.bufferData(t.ARRAY_BUFFER,o,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.startTime),t.bufferData(t.ARRAY_BUFFER,s,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.lifetime),t.bufferData(t.ARRAY_BUFFER,c,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.size),t.bufferData(t.ARRAY_BUFFER,l,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.baseOpacity),t.bufferData(t.ARRAY_BUFFER,u,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.color),t.bufferData(t.ARRAY_BUFFER,d,t.STATIC_DRAW)}function f(){let n=0,r=0;o.forEach(e=>{n=Math.max(n,e.config.width),r=Math.max(r,e.config.height)}),o.size===0&&(n=R.width,r=R.height),(e.width!==n*a||e.height!==r*a)&&(e.width=n*a,e.height=r*a,e.style.width=n+`px`,e.style.height=r+`px`),t.viewport(0,0,e.width,e.height)}function p(){t.useProgram(i),t.uniform2f(s.uniforms.resolution,e.width,e.height),t.uniformMatrix2fv(s.uniforms.rotationMatrices,!1,xe()),t.enable(t.BLEND),t.blendFunc(t.ONE,t.ONE_MINUS_SRC_ALPHA),t.clearColor(0,0,0,0)}function m(e){c&&=(t.clear(t.COLOR_BUFFER_BIT),o.forEach(n=>{let r=(e-n.startTime)/1e3;t.uniform1f(s.uniforms.time,r),t.uniform1f(s.uniforms.canvasWidth,n.config.width*a),t.uniform1f(s.uniforms.canvasHeight,n.config.height*a),t.uniform1f(s.uniforms.accelerationFactor,n.config.accelerationFactor),t.uniform1f(s.uniforms.fadeInTime,n.config.fadeInTime),t.uniform1f(s.uniforms.fadeOutTime,n.config.fadeOutTime),t.uniform1f(s.uniforms.edgeFadeZone,n.config.edgeFadeZone*a),t.uniform2f(s.uniforms.spawnCenter,n.centerX*a,n.centerY*a),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.startPosition),t.enableVertexAttribArray(s.attributes.startPosition),t.vertexAttribPointer(s.attributes.startPosition,2,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.velocity),t.enableVertexAttribArray(s.attributes.velocity),t.vertexAttribPointer(s.attributes.velocity,2,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.startTime),t.enableVertexAttribArray(s.attributes.startTime),t.vertexAttribPointer(s.attributes.startTime,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.lifetime),t.enableVertexAttribArray(s.attributes.lifetime),t.vertexAttribPointer(s.attributes.lifetime,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.size),t.enableVertexAttribArray(s.attributes.size),t.vertexAttribPointer(s.attributes.size,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.baseOpacity),t.enableVertexAttribArray(s.attributes.baseOpacity),t.vertexAttribPointer(s.attributes.baseOpacity,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.color),t.enableVertexAttribArray(s.attributes.color),t.vertexAttribPointer(s.attributes.color,3,t.FLOAT,!1,0,0),t.drawArrays(t.POINTS,0,n.config.particleCount)}),requestAnimationFrame(m))}function h(e){let n=O(),r={...R,...e},i={id:n,config:r,buffers:{startPosition:t.createBuffer(),velocity:t.createBuffer(),startTime:t.createBuffer(),lifetime:t.createBuffer(),size:t.createBuffer(),baseOpacity:t.createBuffer(),color:t.createBuffer()},startTime:performance.now(),seed:Math.floor(Math.random()*1e6),centerX:r.width/2+r.centerShift[0],centerY:r.height/2+r.centerShift[1],avgDistance:(r.width/2+r.height/2)/2};return o.set(n,i),u(i),f(),r.selfDestroyTime&&(i.selfDestroyTimeout=window.setTimeout(()=>{g(n)},r.selfDestroyTime*1e3)),o.size===1&&(p(),l=d.subscribe(()=>{let e=!d();e&&!c?c=requestAnimationFrame(m):!e&&c&&(cancelAnimationFrame(c),c=void 0)}),c=requestAnimationFrame(m)),()=>g(n)}function g(e){let n=o.get(e);n&&(n.selfDestroyTimeout&&clearTimeout(n.selfDestroyTimeout),Object.values(n.buffers).forEach(e=>{e&&t.deleteBuffer(e)}),o.delete(e),o.size===0&&_())}function _(){c!==void 0&&(cancelAnimationFrame(c),c=void 0),l?.(),o.clear(),t.deleteProgram(i),t.deleteShader(n),t.deleteShader(r),z.delete(e)}return{addSystem:h}}var _e=`
    attribute vec2 a_startPosition;
    attribute vec2 a_velocity;
    attribute float a_startTime;
    attribute float a_lifetime;
    attribute float a_size;
    attribute float a_baseOpacity;
    attribute vec3 a_color;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_canvasWidth;
    uniform float u_canvasHeight;
    uniform float u_accelerationFactor;
    uniform float u_fadeInTime;
    uniform float u_fadeOutTime;
    uniform float u_edgeFadeZone;
    uniform mat2 u_rotationMatrices[18];
    uniform vec2 u_spawnCenter;

    varying float v_opacity;
    varying vec3 v_color;

    void main() {
        float totalAge = u_time - a_startTime;
        float age = mod(totalAge, a_lifetime);

        // For the initial animation, fade in all particles
        float globalFadeIn = min(u_time / u_fadeInTime, 1.0);

        float lifeRatio = age / a_lifetime;

        // Calculate rotation based on completed lifecycles
        float lifecycleCount = floor(totalAge / a_lifetime);
        int rotationIndex = int(mod(lifecycleCount, 18.0));

        // Get rotation matrix
        mat2 rotationMatrix = u_rotationMatrices[rotationIndex];

        // Rotate start position around spawn center
        vec2 startOffset = a_startPosition - u_spawnCenter;
        vec2 rotatedStartOffset = rotationMatrix * startOffset;
        vec2 rotatedStartPosition = u_spawnCenter + rotatedStartOffset;

        // Apply rotation matrix to velocity
        vec2 rotatedVelocity = rotationMatrix * a_velocity;

        // Apply shoot-out effect: fast initial speed that slows down
        float speedMultiplier = 1.0 + u_accelerationFactor * exp(-3.0 * lifeRatio);

        vec2 position = rotatedStartPosition + rotatedVelocity * age * speedMultiplier;

        float opacity = 1.0;
        if (lifeRatio < u_fadeInTime / a_lifetime) {
            opacity = (lifeRatio * a_lifetime) / u_fadeInTime;
        } else if (lifeRatio > 1.0 - u_fadeOutTime / a_lifetime) {
            opacity = (1.0 - lifeRatio) * a_lifetime / u_fadeOutTime;
        }
        opacity *= a_baseOpacity * globalFadeIn;

        float distToLeft = position.x;
        float distToRight = u_canvasWidth - position.x;
        float distToTop = position.y;
        float distToBottom = u_canvasHeight - position.y;
        float distToEdge = min(min(distToLeft, distToRight), min(distToTop, distToBottom));

        if (distToEdge < u_edgeFadeZone) {
            opacity *= distToEdge / u_edgeFadeZone;
        }

        vec2 clipSpace = ((position / u_resolution) * 2.0 - 1.0) * vec2(1, -1);
        gl_Position = vec4(clipSpace, 0, 1);
        gl_PointSize = a_size;
        v_opacity = opacity;
        v_color = a_color;
    }
`,ve=`
    precision mediump float;

    varying float v_opacity;
    varying vec3 v_color;

    void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);

        // Create a four-pointed star
        float absX = abs(coord.x);
        float absY = abs(coord.y);

        // Star parameters
        float innerSize = 0.12;    // Size of center square
        float armLength = 0.45;    // Length of star arms
        float armWidth = 0.08;     // Half-width of star arms at base

        float dist = 1.0; // Default to outside

        // Center square
        if (absX <= innerSize && absY <= innerSize) {
            dist = max(absX, absY) - innerSize;
        }
        // Horizontal arms (left and right points)
        else if (absY <= armWidth && absX <= armLength) {
            // Taper the arms - they get narrower toward the tips
            float normalizedX = (absX - innerSize) / (armLength - innerSize);
            float taperFactor = 1.0 - normalizedX * 0.8; // Taper to 20% of original width
            float currentArmWidth = armWidth * taperFactor;
            dist = absY - currentArmWidth;
        }
        // Vertical arms (top and bottom points)
        else if (absX <= armWidth && absY <= armLength) {
            // Taper the arms - they get narrower toward the tips
            float normalizedY = (absY - innerSize) / (armLength - innerSize);
            float taperFactor = 1.0 - normalizedY * 0.8; // Taper to 20% of original width
            float currentArmWidth = armWidth * taperFactor;
            dist = absX - currentArmWidth;
        }

        // Use smoothstep for anti-aliasing to reduce subpixel artifacts
        float alpha = 1.0 - smoothstep(-0.01, 0.01, dist);

        if (alpha <= 0.0) {
            discard;
        }

        gl_FragColor = vec4(v_color * v_opacity * alpha, v_opacity * alpha);
    }
`;function V(e,t,n){let r=e.createShader(t);if(r){if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){e.deleteShader(r);return}return r}}function ye(e,t,n){let r=e.createProgram();if(r){if(e.attachShader(r,t),e.attachShader(r,n),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS)){e.deleteProgram(r);return}return r}}var be=class{seed;constructor(e){this.seed=e}next(){return this.seed=(this.seed*9301+49297)%233280,this.seed/233280}nextBetween(e,t){return e+(t-e)*this.next()}},H;function xe(){if(!H){H=new Float32Array(72);for(let e=0;e<18;e++){let t=220*Math.PI/180*e,n=Math.cos(t),r=Math.sin(t);H[e*4]=n,H[e*4+1]=r,H[e*4+2]=-r,H[e*4+3]=n}}return H}function Se(e,t){if(e instanceof k)return e;let[n,r]=e,[i,a,o]=n.coords,[s,c,l]=r.coords;return new k(`srgb`,[t.nextBetween(i||0,s||0),t.nextBetween(a||0,c||0),t.nextBetween(o||0,l||0)])}var Ce={sparkles:`JxY8hVTW`},we={centerShift:[0,-36]},Te=8,Ee=T(({color:t=`purple`,centerShift:r=we.centerShift,isDisabled:i,className:a,onRequestAnimation:o})=>{let s=C(),c=C(0);return E(()=>{if(!i)return B(s.current,{color:de[`${t}Gradient`],centerShift:r})},[r,t,i]),S(()=>{o&&o(()=>{if(i)return;let e=Date.now();e-c.current<Te||(c.current=e,B(s.current,{color:de[`${t}Gradient`],centerShift:r,...fe}))})},[r,t,i,o]),e(`canvas`,{ref:s,className:n(Ce.sparkles,a)})}),De={root:`CHDf16MJ`,diamond:`UM7C8oRj`},Oe=``+new URL(`diamond-57JalFxA.png`,import.meta.url).href,ke=5,Ae=1,je=300,Me=1500,U,W=!0,Ne={isCancelled:!1};function Pe({className:t,onMouseMove:r}){let[i,a]=x(Ae),o=l(()=>{U&&=(clearTimeout(U),void 0),U=window.setTimeout(()=>{let e=Date.now();W=!0,re(()=>{if(!W)return!1;let t=Math.min((Date.now()-e)/Me,1),n=4*(1-Ie(t));return a(n),W=t<1&&n>1,W},y,Ne)},je),W=!1,a(ke),r()});return e(`div`,{className:n(De.root,t),children:e(`div`,{className:De.diamond,onMouseMove:o,children:e(ee,{speed:i,size:130,tgsUrl:N.Diamond,previewUrl:Oe,nonInteractive:!0,noLoop:!1})})})}var Fe=T(Pe);function Ie(e){return 1-(1-e)**2}var G={root:`QcfrGLdX`,star:`nDPg-zs5`,star_purple:`-f2S1Tk6`,starPurple:`-f2S1Tk6`},Le=50;function Re({className:t,color:r,centerShift:i,onMouseMove:a}){let o=C(),s=l(e=>{let t=e.currentTarget.getBoundingClientRect(),n=t.left+t.width/2+i[0],r=t.top+t.height/2+i[1],s=e.clientX-n,c=e.clientY-r,l=Math.max(-1,Math.min(1,s/Le)),u=Math.max(-1,Math.min(1,c/Le)),d=l*40,f=-u*40;y(()=>{o.current.style.transform=`scale(1.1) rotateX(${f}deg) rotateY(${d}deg)`}),a()}),c=l(()=>{y(()=>{o.current.style.transform=``})});return e(`div`,{className:n(G.root,t),onMouseMove:s,onMouseLeave:c,children:e(`div`,{ref:o,className:n(G.star,G[`star_${r}`]),role:`img`,"aria-label":`Telegram Stars`})})}var ze=T(Re),K={root:`cK6KQXnQ`,"ai-egg":`ZP86O9Hy`,aiEgg:`ZP86O9Hy`,title:`xRm-Im3m`,description:`IQdQ9MU9`,particles:`_8ooQ3s8b`,stickerWrapper:`hHs2sTV-`,cocoon:`Rlhm9gZk`},Be=``+new URL(`cocoon-DzgJltGQ.webp`,import.meta.url).href,q=8*c,Ve={centerShift:[0,-36]};function He({model:t,sticker:r,color:i,title:o,description:s,isDisabled:c,className:u,modelClassName:d}){let f=C(),p=C(),m=l(()=>{p.current?.()}),h=l(e=>{p.current=e});return a(`div`,{className:n(K.root,K[t],u),children:[e(Ee,{color:i,centerShift:Ve.centerShift,isDisabled:c,className:K.particles,onRequestAnimation:h}),t===`swaying-star`?e(ze,{className:d,color:i,centerShift:Ve.centerShift,onMouseMove:m}):t===`ai-egg`?e(`img`,{src:Be,alt:``,role:`presentation`,"aria-hidden":`true`,className:n(K.cocoon,d),draggable:!1,onMouseMove:m}):t===`speeding-diamond`?e(Fe,{className:d,onMouseMove:m}):t===`sticker`&&r&&e(`div`,{ref:f,className:n(K.stickerWrapper,d),style:`width: ${q}px; height: ${q}px`,onMouseMove:m,children:e(A,{containerRef:f,sticker:r,size:q,shouldPreloadPreview:!0,shouldLoop:!0})}),e(`h2`,{className:K.title,children:o}),e(`div`,{className:K.description,children:s})]})}var Ue=T(He),J={root:`_7NV36hp3`,wrapper:`_32sWnI-2`,down:`DkDmNeYG`,frame:`M0hUT4cv`,video:`eWi57MWV`,placeholder:`A38HRiXg`},We=``+new URL(`DeviceFrame-Dqm_t18H.svg`,import.meta.url).href,Ge=T(({videoId:t,videoThumbnail:r,isActive:i,isReverseAnimation:o,isDown:s,index:c,className:l,wrapperClassName:u})=>{let d=ne(t?`document${t}`:void 0),f=se(r?.dataUri),p=P(d);return e(`div`,{className:n(J.root,l),children:a(`div`,{className:n(J.wrapper,o&&J.reverse,s&&J.down,u),id:c===void 0?void 0:`premium_feature_preview_video_${c}`,children:[e(`img`,{src:We,alt:``,className:J.frame,draggable:!1}),!t&&e(`div`,{className:J.placeholder}),r&&e(`canvas`,{ref:f,className:J.video}),t&&e(j,{canPlay:!!i,className:n(J.video,p),src:d,disablePictureInPicture:!0,playsInline:!0,muted:!0,loop:!0})]})})}),Y={options:`Upert7zo`,option:`_2X6-9ciP`,active:`zpGahRpW`,wideOption:`dI8-J8yI`,optionTop:`wgA5YkCl`,stackedStars:`TZ71sXrE`,stackedStar:`_6CGkOJue`,optionBottom:`GRPtw1Lm`,moreOptions:`cY6CHTaj`,iconDown:`qdRs-uv4`},Ke=6,qe=T(({isActive:r,className:c,options:l,selectedStarOption:d,selectedStarCount:f,starsNeeded:_,onClick:v})=>{let y=t(),b=g(),[x,C,w]=s();S(()=>{r||w()},[r]);let[T,E]=D(()=>{if(!l)return[void 0,!1];let e=l.reduce((e,t)=>e.stars>t.stars?e:t),t=_&&e.stars<_,n=[],r=0,i=!1;return l.forEach((e,a)=>{if(e.isExtended||r++,!(_&&!t&&e.stars<_)){if(!x&&e.isExtended){i=!0;return}n.push({option:e,starsCount:Math.min(r,Ke),isWide:a===l.length-1})}}),[n,i]},[x,l,_]);return a(`div`,{className:n(Y.options,c),children:[T?.map(({option:t,starsCount:r,isWide:s})=>{let c=T?.length%2==0,l=t===d,p;return t&&`winners`in t&&(p=(t.winners.find(e=>e.users===f)||t.winners.reduce((e,t)=>t.users>e.users?t:e,t.winners[0]))?.perUserStars),a(`div`,{className:n(Y.option,!c&&s&&Y.wideOption,l&&Y.active),onClick:()=>v?.(t),children:[a(`div`,{className:Y.optionTop,children:[`+`,o(t.stars),e(`div`,{className:Y.stackedStars,dir:b.isRtl?`ltr`:`rtl`,children:Array.from({length:r}).map(()=>e(u,{className:Y.stackedStar,type:`gold`,size:`big`}))})]}),e(`div`,{className:Y.optionBottom,children:i(b,t.amount,t.currency)}),(l||d&&`winners`in d)&&!!p&&e(`div`,{className:Y.optionBottom,children:e(`div`,{className:Y.perUserStars,children:h(y(`BoostGift.Stars.PerUser`,o(p)))})})]},t.stars)}),!x&&E&&a(m,{className:Y.moreOptions,isText:!0,noForcedUpperCase:!0,onClick:C,children:[y(`Stars.Purchase.ShowMore`),e(p,{className:Y.iconDown,name:`down`})]})]})}),X={content:`j63Xdo6p`,fixedHeight:`E-xx83T0`,withSearch:`sT1YPCzK`,header:`RwB3BKcO`,buttonWrapper:`Z-xvJZEk`},Je=`.${ae.pickerList}`,Ye=T(({confirmButtonText:r,isConfirmDisabled:i,shouldAdaptToSearch:o,withFixedHeight:s,onConfirm:c,withPremiumGradient:l,itemsContainerSelector:u=Je,...d})=>{let f=t(),p=!!(r||c),h=C();return ie({containerRef:h,selector:`.modal-content ${u}`,isBottomNotch:p,shouldHideTopNotch:!0},[d.isOpen]),a(F,{...d,dialogRef:h,isSlim:!0,className:n(o&&X.withSearch,s&&X.fixedHeight,d.className),contentClassName:n(X.content,d.contentClassName),headerClassName:n(X.header,d.headerClassName),isCondensedHeader:!0,children:[d.children,p&&e(`div`,{className:X.buttonWrapper,children:e(m,{withPremiumGradient:l,onClick:c||d.onClose,color:`primary`,disabled:i,children:r||f(`Confirm`)})})]})}),Z={table:`RMEi5Sgb`,cell:`AEl8NMjg`,title:`IypKoG1m`,value:`ZO-KCUSl`,fullWidth:`_1WIqSuNB`,chatItem:`J6it2-iy`},Xe=T(({tableData:t,className:i,onChatClick:o})=>{let{openChat:s}=_(),c=l(e=>{o?o(e):s({id:e})});if(t?.length)return e(`div`,{className:n(Z.table,i),children:t.map(([t,i])=>a(r,{children:[!!t&&e(`div`,{className:n(Z.cell,Z.title),children:t}),e(`div`,{className:n(Z.cell,Z.value,!t&&Z.fullWidth),children:typeof i==`object`&&`chatId`in i?e(te,{peerId:i.chatId,className:Z.chatItem,forceShowSelf:!0,withEmojiStatus:i.withEmojiStatus,clickArg:i.chatId,onClick:c}):i})]}))})}),Q={content:`rIjOLQyf`,noFooter:`ssGgYoZw`,avatar:`IdvEatvm`},Ze=T(({isOpen:t,title:r,tableData:i,headerAvatarPeer:o,header:s,modalHeader:c,footer:u,buttonText:d,className:f,contentClassName:p,tableClassName:h,hasBackdrop:g,closeButtonColor:v,moreMenuItems:y,headerRightToolBar:b,onClose:x,onButtonClick:S,withBalanceBar:C,isLowStackPriority:w,currencyInBalanceBar:T})=>{let{openChat:E}=_(),D=l(e=>{E({id:e}),x()});return a(F,{isOpen:t,hasCloseButton:!!r,hasAbsoluteCloseButton:!r,absoluteCloseButtonColor:v||(g?`translucent-white`:void 0),isSlim:!0,header:c,title:r,className:f,contentClassName:n(Q.content,p),moreMenuItems:y,headerRightToolBar:b,onClose:x,withBalanceBar:C,currencyInBalanceBar:T,isLowStackPriority:w,children:[o&&e(M,{peer:o,size:`jumbo`,className:Q.avatar}),s,e(Xe,{tableData:i,className:h,onChatClick:D}),u,d&&e(m,{className:u?void 0:Q.noFooter,onClick:S||x,children:d})]})}),$={root:`FEEwg5rl`,secondary:`_51eeI1vd`,topIcon:`_0fVPMdEi`,premiumGradient:`oEaPoig5`,content:`_7xJ2IMc7`,listItems:`_4Smlf3-h`,listItemTitle:`lPVHA-w3`,separator:`V6iMhrLh`},Qe=T(({className:t,isOpen:r,listItemData:i,headerIconName:o,headerIconPremiumGradient:s,header:c,footer:l,buttonText:u,hasBackdrop:d,absoluteCloseButtonColor:f,withSeparator:h,contentClassName:g,onClose:_,onButtonClick:v})=>a(F,{isOpen:r,className:n($.root,t),contentClassName:n($.content,g),hasAbsoluteCloseButton:!0,absoluteCloseButtonColor:f||(d?`translucent-white`:void 0),onClose:_,children:[o&&e(`div`,{className:n($.topIcon,s&&$.premiumGradient),children:e(p,{name:o})}),c,e(`div`,{className:$.listItems,children:i?.map(([t,r,i])=>a(I,{isStatic:!0,multiline:!0,icon:t,className:$.listItem,children:[e(`span`,{className:n(`title`,$.listItemTitle),children:r}),e(`span`,{className:`subtitle`,children:i})]}))}),h&&e(oe,{className:$.separator}),l,!!u&&e(m,{onClick:v||_,children:u})]})),$e={root:`JaXKxj2K`,arrow:`_-7ow-ETi`},et=4*c,tt=T(({fromPeer:t,toPeer:n,avatarSize:r=et})=>a(`div`,{className:$e.root,children:[e(M,{peer:t,size:r}),e(p,{name:`next`,className:$e.arrow}),e(M,{peer:n,size:r})]}));export{Ye as a,Ue as c,ce as d,Xe as i,Ee as l,Qe as n,qe as o,Ze as r,Ge as s,tt as t,le as u};
//# sourceMappingURL=TransferBetweenPeers-C6et79_0.js.map