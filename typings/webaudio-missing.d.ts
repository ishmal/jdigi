

interface MediaStream {
    id: string;
    active: boolean;
}

interface MediaStreamAudioSourceNode extends AudioNode {

}

interface MediaStreamAudioDestinationNode extends AudioNode {
    stream: MediaStream;
}

interface AudioContext {
    new(): AudioContext;
    //state: string;
    close: () => void;
    createMediaStreamSource: (MediaStream) => MediaStreamAudioSourceNode;
    createMediaStreamDestination: () => any;
    resume: () => void;
    suspend: () => void;
}

interface Window {
  AudioContext: AudioContext;
  webkitAudioContext: AudioContext;
}
