// import React, { useState } from 'react';
// import { HfInference } from '@huggingface/inference';

// const ImageToText = () => {
//     const [text, setText] = useState<string | null>(null);

//     const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (!file) return;

//         // Read the image file
//         const reader = new FileReader();
//         reader.onload = async () => {
//             const imageDataUrl = reader.result as string;

//             // Initialize the Hugging Face Inference API
//             const hf = new HfInference('your-huggingface-api-key-here');

//             // Call the Hugging Face Inference API
//             const result = await hf.imageToText({
//                 model: 'microsoft/trocr-base-handwritten',
//                 data: imageDataUrl,
//             });

//             setText(result.generated_text);
//         };

//         reader.readAsDataURL(file);
//     };

//     return (
//         <div>
//             <h1>Handwritten Text Recognition</h1>
//             <input type="file" accept="image/*" onChange={handleImageUpload} />
//             {text && (
//                 <div>
//                     <h2>Recognized Text:</h2>
//                     <p>{text}</p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ImageToText;
