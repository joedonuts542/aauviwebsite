"use client";

import { useEffect, useState } from "react";

import { MoonLoader } from "react-spinners";

export const Icon = (props: {
    gameId: string,
    onError: () => JSX.Element,
    className?: string
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [image, setImage] = useState<string>();

    useEffect(() => {
        let cache = window.localStorage.getItem(`game-${props.gameId}`);
        if (cache) {
            setImage(cache)
            setLoading(false);
        } else {
            fetch(
                `/api/content/game-icon?placeId=${props.gameId}&size=150x150&format=png`
            ).then((response) => {
                if (
                    response.status === 200
                ) {
                    const tryJson = async () => {
                        try {
                            const body = await response.json();
                            if (Array.isArray(body.data)) {
                                setImage(body.data[0].imageUrl);
                                setLoading(false);
                                window.localStorage.setItem(`logo-${props.gameId}`, body.data[0].imageUrl);
                            }
                        } catch (error) {
                            setLoading(false);
                        }
                    }

                    tryJson();
                }
            }).catch((error) => {
                setLoading(false);
            })
        }
    }, [props])

    return loading
        ? <>
            <MoonLoader
                size={8}
                className={props.className}
                color={"#6366f1"}
            />
        </>
        : <>
            {
                image
                    ? <img
                        src={image}
                        alt={"avatar"}
                        className={props.className}
                    />
                    : <props.onError />
            }
        </>
}