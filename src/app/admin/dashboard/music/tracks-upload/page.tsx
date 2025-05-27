'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronUp, CircleCheck, Circle } from 'lucide-react';
import { getAudioDuration } from '@/lib/utils';
import { deleteFromBucket, getSignedUploadUrl } from '@/actions/r2-actions';
import axios from 'axios';
import { addAlbumToDb } from '@/actions/db-tracks-actions';
import { Prisma } from '@/generated/prisma';
import { ClipLoader, RingLoader } from 'react-spinners'
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Track {
    id: string;
    title: string;
    artist: string;
    album: string;
    remixers: string;
    duration: string;
    file: File;
    isExpanded: boolean;
    uploadState: "pre" | "uploading" | "finished"
}



function SortableTrack({
    track,
    index,
    onTitleChange,
    onArtistChange,
    onAlbumChange,
    onRemixersChange,
    onToggleExpand
}: {
    track: Track;
    index: number;
    onTitleChange: (value: string) => void;
    onArtistChange: (value: string) => void;
    onAlbumChange: (value: string) => void;
    onRemixersChange: (value: string) => void;
    onToggleExpand: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: track.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleExpand();
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex flex-col bg-black rounded-lg border border-white/10 hover:border-white/20 transition-colors"
        >
            <div className="flex items-center justify-between px-4 py-2 gap-x-3">
                <div className="flex items-center gap-x-3 flex-1">
                    <span className="text-white/60 font-medium min-w-[2rem]">{index + 1}.</span>
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-move p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <GripVertical className="w-4 h-4 text-white/40" />
                    </div>
                    <input
                        type="text"
                        value={track.title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className="p-1.5 border border-white/10 rounded-lg bg-black text-white flex-1 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20"
                        placeholder="track title"
                    />
                </div>
                <div>
                    {{
                        pre: <Circle />,
                        uploading: <RingLoader loading={true} color='white' size={24} />,
                        finished: <CircleCheck />

                    }[track.uploadState]}
                </div>
                <div className="flex items-center gap-x-3">
                    <span className="text-white/60 font-mono">{track.duration}</span>
                    <button
                        type="button"
                        onClick={handleToggleExpand}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        {track.isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-white/40" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-white/40" />
                        )}
                    </button>
                </div>
            </div>

            {track.isExpanded && (
                <div className="px-4 py-3 border-t border-white/10 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-white/60 mb-1">artist</label>
                            <input
                                type="text"
                                value={track.artist}
                                onChange={(e) => onArtistChange(e.target.value)}
                                className="w-full p-1.5 border border-white/10 rounded-lg bg-black text-white focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20"
                                placeholder="artist name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-1">album</label>
                            <input
                                type="text"
                                value={track.album}
                                onChange={(e) => onAlbumChange(e.target.value)}
                                className="w-full p-1.5 border border-white/10 rounded-lg bg-black text-white focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20"
                                placeholder="album name"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-white/60 mb-1">remixers</label>
                        <input
                            type="text"
                            value={track.remixers}
                            onChange={(e) => onRemixersChange(e.target.value)}
                            className="w-full p-1.5 border border-white/10 rounded-lg bg-black text-white focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20"
                            placeholder="remixers (comma separated)"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TracksUploadPage() {
    const router = useRouter();
    const [albumArt, setAlbumArt] = useState<File | null>(null);
    const [albumArtPreview, setAlbumArtPreview] = useState<string>('');
    const [tracks, setTracks] = useState<Track[]>([]);
    const [artist, setArtist] = useState('');
    const [albumName, setAlbumName] = useState('');
    const [isUploading, setIsUploading] = useState<"pre" | "uploading" | "finished">("pre");
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const onAlbumArtDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setAlbumArt(file);
            const preview = URL.createObjectURL(file);
            setAlbumArtPreview(preview);
        }
    }, []);

    const onTracksDrop = useCallback(async (acceptedFiles: File[]) => {
        const newTracks = await Promise.all(
            acceptedFiles.map(async (file, index) => {
                const duration = await getAudioDuration(file);
                return {
                    id: index.toString(),
                    title: file.name.replace(/\.[^/.]+$/, ''),
                    artist: artist,
                    album: albumName,
                    remixers: '',
                    duration,
                    file: file,
                    isExpanded: false,
                    uploadState: "pre"
                } as Track;
            })
        );
        setTracks(prev => [...prev, ...newTracks]);
    }, [artist, albumName]);

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setTracks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    };

    const handleArtistChange = (value: string) => {
        setArtist(value);
        setTracks(prev => prev.map(track => ({
            ...track,
            artist: value
        })));
    };

    const handleAlbumNameChange = (value: string) => {
        setAlbumName(value);
        setTracks(prev => prev.map(track => ({
            ...track,
            album: value
        })));
    };

    const { getRootProps: getAlbumArtRootProps, getInputProps: getAlbumArtInputProps } = useDropzone({
        onDrop: onAlbumArtDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1
    });

    const { getRootProps: getTracksRootProps, getInputProps: getTracksInputProps } = useDropzone({
        onDrop: onTracksDrop,
        accept: {
            'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
        },
        multiple: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading("uploading");

        if (
            !albumArt ||
            !albumName ||
            !artist ||
            !(tracks.length > 0)
        ) return;

        const uploadedKeys: string[] = [];
        try {

            const albumArtUploadUrl = await getSignedUploadUrl(`AlbumImage-${albumName}-${artist}`)
            if (!albumArtUploadUrl.success) throw new Error();
            await axios.put(albumArtUploadUrl.data.url, albumArt);
            uploadedKeys.push(albumArtUploadUrl.data.uniqueKey)

            const trackInputs: Prisma.TrackCreateWithoutAlbumInput[] = await Promise.all(
                tracks.map(async (track, index) => {
                    setTracks(prev =>
                        prev.map((t, i) =>
                            i === index ? { ...t, uploadState: 'uploading' } : t
                        )
                    );
                    const trackUploadUrl = await getSignedUploadUrl(track.file.name);
                    if (!trackUploadUrl.success) throw new Error();
                    await axios.put(trackUploadUrl.data.url, track.file)
                    uploadedKeys.push(trackUploadUrl.data.uniqueKey)
                    setTracks(prev =>
                        prev.map((t, i) =>
                            i === index ? { ...t, uploadState: 'finished' } : t
                        )
                    );
                    return {
                        title: track.title,
                        artist: track.artist,
                        remixers: track.remixers,
                        duration: track.duration,
                        trackBucketKey: trackUploadUrl.data.uniqueKey
                    }
                })
            )


            const albumData: Prisma.AlbumCreateInput = {
                name: albumName,
                artist,
                albumArtBucketKey: albumArtUploadUrl.data.uniqueKey,
                tracks: {
                    create: trackInputs
                },
            };

            const addAlbumResult = await addAlbumToDb(albumData);
            if (!addAlbumResult.success) throw new Error()

        } catch (error) {
            try {
                await Promise.all(uploadedKeys.map((key) => deleteFromBucket(key)))
            } catch (error) {
            }
        } finally {
            setTimeout(() => {setIsUploading("finished");}, 1000)
            
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">upload new album</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">artist name</label>
                        <input
                            type="text"
                            value={artist}
                            onChange={(e) => handleArtistChange(e.target.value)}
                            className="w-full p-2 border border-white/10 rounded-lg bg-black text-white focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">album name</label>
                        <input
                            type="text"
                            value={albumName}
                            onChange={(e) => handleAlbumNameChange(e.target.value)}
                            className="w-full p-2 border border-white/10 rounded-lg bg-black text-white focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">album art</label>
                    <div
                        {...getAlbumArtRootProps()}
                        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-500"
                    >
                        <input {...getAlbumArtInputProps()} />
                        {albumArtPreview ? (
                            <img
                                src={albumArtPreview}
                                alt="album art preview"
                                className="max-h-48 mx-auto mb-2"
                            />
                        ) : (
                            <p>drag & drop album art here, or click to select<br />
                                <span className="text-sm text-white/60">jpeg, jpg, png, webp</span></p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">tracks</label>
                    <div
                        {...getTracksRootProps()}
                        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-500"
                    >
                        <input {...getTracksInputProps()} />
                        <p>drag & drop audio files here, or click to select<br />
                            <span className="text-sm text-white/60">mp3, wav, ogg, m4a</span></p>
                    </div>

                    {tracks.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={tracks.map(track => track.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {tracks.map((track, index) => (
                                        <SortableTrack
                                            key={track.id}
                                            track={track}
                                            index={index}
                                            onTitleChange={(value) => {
                                                const newTracks = [...tracks];
                                                newTracks[index].title = value;
                                                setTracks(newTracks);
                                            }}
                                            onArtistChange={(value) => {
                                                const newTracks = [...tracks];
                                                newTracks[index].artist = value;
                                                setTracks(newTracks);
                                            }}
                                            onAlbumChange={(value) => {
                                                const newTracks = [...tracks];
                                                newTracks[index].album = value;
                                                setTracks(newTracks);
                                            }}
                                            onRemixersChange={(value) => {
                                                const newTracks = [...tracks];
                                                newTracks[index].remixers = value;
                                                setTracks(newTracks);
                                            }}
                                            onToggleExpand={() => {
                                                const newTracks = [...tracks];
                                                newTracks[index].isExpanded = !newTracks[index].isExpanded;
                                                setTracks(newTracks);
                                            }}
                                        />
                                    ))}
                                </SortableContext>
                                <DragOverlay>
                                    {activeId ? (
                                        <div className="bg-black rounded-lg border border-white/20 shadow-lg">
                                            <div className="flex items-center justify-between px-4 py-2 gap-x-3">
                                                <div className="flex items-center gap-x-3 flex-1">
                                                    <span className="text-white/60 font-medium min-w-[2rem]">
                                                        {tracks.findIndex(t => t.id === activeId) + 1}.
                                                    </span>
                                                    <div className="p-1.5">
                                                        <GripVertical className="w-4 h-4 text-white/40" />
                                                    </div>
                                                    <div className="p-1.5 border border-white/10 rounded-lg bg-black text-white flex-1">
                                                        {tracks.find(t => t.id === activeId)?.title}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-x-3">
                                                    <span className="text-white/60 font-mono">
                                                        {tracks.find(t => t.id === activeId)?.duration}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </DragOverlay>
                            </DndContext>
                        </div>
                    )}
                </div>

                <div className='w-full flex justify-center p-10'>
                    {{
                    pre:
                        <Button
                            type="submit"
                            disabled={!albumArt || tracks.length === 0}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            upload album
                        </Button>,
                    uploading: <Button variant="destructive">uploading... <ClipLoader loading={true} color="white" /> </Button>, 
                    finished: <Link href='/admin/dashboard'><Button variant="success">go to dashboard</Button></Link>

                }[isUploading]}
                </div>

            </form>
        </div>
    );
}
