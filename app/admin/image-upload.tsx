'use client';
import { useRef,useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export default function ImageUpload({label,value,onChange,onBusyChange}:{label:string;value:string;onChange:(url:string)=>void;onBusyChange:(busy:boolean)=>void}) {
  const input=useRef<HTMLInputElement>(null);
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [message,setMessage]=useState('');
  async function upload(file:File) {
    setError('');setMessage('');
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Choose a JPG, PNG, or WebP image.');return;}
    if(file.size>8*1024*1024){setError('Choose an image smaller than 8 MB.');return;}
    setBusy(true);onBusyChange(true);
    try{
      const response=await fetch('/api/admin/uploads',{method:'POST',headers:{'Content-Type':file.type},body:file});
      const result=await response.json();if(!response.ok)throw new Error(result.error || 'Unable to upload this image.');
      onChange(result.url);setMessage('Image uploaded. Select Save changes to use it on the website.');
    }catch(error){setError(error instanceof Error ? error.message : 'Upload failed. Please try again.');}
    finally{setBusy(false);onBusyChange(false);}
  }
  return <div className="image-upload-field"><span className="image-upload-label">{label}</span><div className="image-upload-preview"><img src={value} alt="Current selected image"/></div><input ref={input} type="file" className="sr-only" tabIndex={-1} accept="image/jpeg,image/png,image/webp" aria-label={`Choose ${label.toLowerCase()}`} disabled={busy} onChange={event=>{const file=event.target.files?.[0];event.target.value='';if(file)void upload(file);}}/><Button type="button" variant="outline" disabled={busy} onClick={()=>input.current?.click()}><Upload size={16}/>{busy ? 'Uploading image…' : 'Upload image'}</Button><small>JPG, PNG, or WebP · Up to 8 MB</small>{busy && <p role="status">Uploading and optimizing your image…</p>}{error && <p className="upload-error" role="alert">{error}</p>}{message && <p className="upload-success" role="status">{message}</p>}<details className="image-url-option"><summary>Or use an image link</summary><label className="admin-field"><span>Image URL</span><Input value={value} disabled={busy} onChange={event=>{setMessage('');onChange(event.target.value);}}/></label></details></div>;
}
