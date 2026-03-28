import { useState } from "react";
import { X, Upload, Loader } from "lucide-react";
import { geminiService, type GeminiAnalysisResult } from "./services/geminiService";

interface AnalysisResult extends GeminiAnalysisResult {}

interface ImageUploadModalProps {
  binId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageUploadModal({ binId, isOpen, onClose }: ImageUploadModalProps) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      setError("कृपया छवि चुनें");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Use Gemini AI to analyze the image
      const analysisResult = await geminiService.analyzeImage(image, binId);

      setResult(analysisResult);
      setImage(null);
      setPreview("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image analysis failed. Please try again.");
      console.error("Image analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1a0f] border border-[#1e2a1e] rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e2a1e] sticky top-0 bg-[#0f1a0f]">
          <h2 className="text-base font-bold text-white">कचरा विश्लेषण ({binId})</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Result Display */}
          {result && (
            <div className={`rounded-lg p-4 space-y-3 ${
              result.isDuplicate
                ? "bg-yellow-900 border border-yellow-700"
                : "bg-[#1e2a1e] border border-[#39ff14]"
            }`}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">कचरे का प्रकार:</span>
                  <span className="font-bold text-[#39ff14]">{result.wasteType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">गंभीरता:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-[#0f1a0f] rounded">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${(result.severityLevel / 10) * 100}%`,
                          background: result.severityLevel > 7 ? "#ef4444" : result.severityLevel > 4 ? "#f59e0b" : "#39ff14"
                        }}
                      />
                    </div>
                    <span className="font-bold text-xs w-6">{result.severityLevel}/10</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">आत्मविश्वास:</span>
                  <span className="font-bold text-[#39ff14]">{(result.confidenceScore * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">स्थिति:</span>
                  <span className={`font-bold text-xs px-2 py-1 rounded ${
                    result.verificationStatus === 'real'
                      ? "bg-green-900 text-green-200"
                      : result.verificationStatus === 'fake_or_duplicate'
                      ? "bg-red-900 text-red-200"
                      : "bg-yellow-900 text-yellow-200"
                  }`}>
                    {result.verificationStatus === 'real' ? '✓ असली' : result.verificationStatus === 'fake_or_duplicate' ? '⚠ डुप्लिकेट' : '? संदिग्ध'}
                  </span>
                </div>
              </div>
              <div className="bg-[#0f1a0f] p-3 rounded border border-[#1e2a1e] text-xs text-gray-300">
                <div className="font-bold mb-1 text-[#39ff14]">सुझाई गई कार्रवाई:</div>
                {result.suggestedAction}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900 border border-red-700 rounded p-3 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Upload Form (show only if no result or user wants to upload again) */}
          {!result && (
            <>
              {/* Image Preview */}
              {preview && (
                <div className="rounded-lg overflow-hidden border border-[#1e2a1e]">
                  <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                </div>
              )}

              {/* Upload Input */}
              <label className="block">
                <div className="border-2 border-dashed border-[#39ff14] rounded-lg p-6 cursor-pointer hover:bg-[#0a0f0a] transition text-center">
                  <Upload size={24} className="mx-auto mb-2 text-[#39ff14]" />
                  <div className="text-sm text-gray-300">छवि चुनें या यहां ड्रैग करें</div>
                  <div className="text-xs text-[#475569] mt-1">JPG, PNG (10MB तक)</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={loading}
                  />
                </div>
              </label>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!image || loading}
                className="w-full bg-[#39ff14] text-black font-bold py-2 rounded-lg hover:bg-[#2fd400] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    विश्लेषण जारी है...
                  </>
                ) : (
                  "विश्लेषण शुरू करें"
                )}
              </button>
            </>
          )}

          {/* Retry Button (show if result exists) */}
          {result && (
            <button
              onClick={() => {
                setResult(null);
                setImage(null);
                setPreview("");
                setError("");
              }}
              className="w-full bg-[#1e2a1e] border border-[#39ff14] text-[#39ff14] font-bold py-2 rounded-lg hover:bg-[#2a3d2a] transition"
            >
              नई छवि अपलोड करें
            </button>
          )}

          {/* Close Button */}
          {result && (
            <button
              onClick={onClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition"
            >
              बंद करें
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
