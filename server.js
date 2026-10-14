const express = require('express');
const session = require('express-session');
const multer = require('multer');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DB_FILE = path.join(ROOT, 'products.json');
const UPLOAD_DIR = ROOT;
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify([
 {id:'p1',name:'The Gulmohar Silk Saree',category:'Sarees',price:6490,compareAt:7990,description:'A statement drape with intricate detailing and a soft, luxurious fall.',image:'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',featured:true,badge:'BESTSELLER'},
 {id:'p2',name:'Noor Embroidered Suit',category:'Suits',price:4290,compareAt:0,description:'Elegant occasionwear, finished with delicate embroidery.',image:'https://images.unsplash.com/photo-1583391733956-6c78276477e8?auto=format&fit=crop&w=1000&q=85',featured:true,badge:'NEW'},
 {id:'p3',name:'Kalamkari Garden Edit',category:'Kalamkari',price:3590,compareAt:4190,description:'Art-inspired prints for timeless everyday elegance.',image:'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=85',featured:true,badge:'LIMITED'},
 {id:'p4',name:'Meher Festive Lehenga',category:'Lehengas',price:8990,compareAt:0,description:'A festive silhouette made for unforgettable celebrations.',image:'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85',featured:false,badge:''}
],null,2));
function readProducts(){try{return JSON.parse(fs.readFileSync(DB_FILE,'utf8'))}catch{return []}}
function writeProducts(p){fs.writeFileSync(DB_FILE,JSON.stringify(p,null,2))}
app.use(helmet({contentSecurityPolicy:false}));
app.use(express.json({limit:'1mb'})); app.use(express.urlencoded({extended:true}));
app.use(session({secret:process.env.SESSION_SECRET || 'change-this-session-secret-before-launch',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:8*60*60*1000}}));
app.get('/uploads/:filename',(req,res,next)=>{const filename=path.basename(req.params.filename);res.sendFile(path.join(ROOT,filename),err=>{if(err)next()})}); app.use(express.static(ROOT, {index:false}));
const storage=multer.diskStorage({destination:(_,__,cb)=>cb(null,UPLOAD_DIR),filename:(_,file,cb)=>{const ext=path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g,'');cb(null,Date.now()+'-'+Math.random().toString(36).slice(2,8)+ext)}});
const upload=multer({storage,limits:{fileSize:5*1024*1024},fileFilter:(_,f,cb)=>cb(null,/^image\/(jpeg|png|webp|gif)$/.test(f.mimetype))});
function adminOnly(req,res,next){if(req.session && req.session.admin)return next();return res.status(401).json({error:'Please sign in as admin first.'})}
app.get('/api/products',(req,res)=>res.json(readProducts()));
app.post('/api/admin/login',(req,res)=>{const u=process.env.ADMIN_USERNAME||'admin',p=process.env.ADMIN_PASSWORD;if(!p)return res.status(503).json({error:'Set ADMIN_USERNAME and ADMIN_PASSWORD in environment variables before using the admin panel.'});if(req.body.username===u&&req.body.password===p){req.session.admin=true;return res.json({ok:true})}res.status(401).json({error:'Incorrect username or password.'})});
app.get('/api/admin/session',(req,res)=>res.json({loggedIn:!!(req.session&&req.session.admin)}));
app.post('/api/admin/logout',adminOnly,(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.post('/api/admin/products',adminOnly,upload.single('imageFile'),(req,res)=>{try{const products=readProducts(),b=req.body;const name=(b.name||'').trim();if(!name)return res.status(400).json({error:'Product name is required.'});const image=req.file?'/uploads/'+req.file.filename:(b.image||'').trim();if(!image)return res.status(400).json({error:'Upload an image or provide an image URL.'});const item={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),name,category:(b.category||'New Arrivals').trim(),price:Number(b.price)||0,compareAt:Number(b.compareAt)||0,description:(b.description||'').trim(),image,featured:b.featured==='true',badge:(b.badge||'').trim()};products.unshift(item);writeProducts(products);res.status(201).json(item)}catch(e){res.status(500).json({error:'Could not save product.'})}});
app.put('/api/admin/products/:id',adminOnly,upload.single('imageFile'),(req,res)=>{const products=readProducts(),i=products.findIndex(p=>p.id===req.params.id);if(i<0)return res.status(404).json({error:'Product not found.'});const b=req.body,old=products[i];products[i]={...old,name:(b.name||old.name).trim(),category:(b.category||old.category).trim(),price:b.price===''?old.price:Number(b.price),compareAt:b.compareAt===''?old.compareAt:Number(b.compareAt),description:b.description??old.description,image:req.file?'/uploads/'+req.file.filename:((b.image||'').trim()||old.image),featured:b.featured===undefined?old.featured:b.featured==='true',badge:b.badge??old.badge};writeProducts(products);res.json(products[i])});
app.delete('/api/admin/products/:id',adminOnly,(req,res)=>{const ps=readProducts(),next=ps.filter(p=>p.id!==req.params.id);if(next.length===ps.length)return res.status(404).json({error:'Product not found.'});writeProducts(next);res.json({ok:true})});
app.get('/admin',(req,res)=>res.sendFile(path.join(ROOT,'admin.html')));
app.get('*',(req,res)=>res.sendFile(path.join(ROOT,'index.html')));
app.listen(PORT,()=>console.log('KIRUU Fashion Store running on port '+PORT));
