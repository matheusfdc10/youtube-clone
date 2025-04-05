"use client"

import { Button } from "@/components/ui/button";
import { APP_URL } from "@/constants";
import { ArrowLeftIcon, SearchIcon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const SearchInput = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const query = searchParams.get("query") || "";
    const categoryId = searchParams.get("categoryId") || "";

    const [value, setValue] = useState(query);
    const [isSearchInputOpen, setIsSearchInputOpen] = useState(false);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const url = new URL("/search", APP_URL);
        const newQuery = value.trim();

        url.searchParams.set("query", newQuery);

        if (categoryId) {
            url.searchParams.set("categoryId", categoryId);
        }
        
        if (newQuery === "") {
            url.searchParams.delete("query")
        }

        setValue(newQuery);
        router.push(url.toString());
    }

    return (
        <>
            {/* mobile */}
            <div className="flex-1 flex sm:hidden justify-end max-w-[720px] mx-auto">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setIsSearchInputOpen(true)}
                >
                    <SearchIcon className="size-6"/>
                </Button>
                {isSearchInputOpen && (
                    <div className="absolute top-0 bottom-0 left-0 right-0 bg-white z-10 flex items-center gap-8">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => setIsSearchInputOpen(false)}
                        > 
                            <ArrowLeftIcon className="size-6"/>
                        </Button>
                        <form onSubmit={handleSearch} className="flex w-full max-w-[600px]">
                            <div className="relative w-full">
                                <input
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    type="text"
                                    placeholder="Search"
                                    className="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500"
                                />
                                {value && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setValue("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                                    >
                                        <XIcon className="text-gray-500"/>
                                    </Button>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={!value.trim()}
                                className="px-5 py-2.5 bg-gray-100 border border-l-0 rounded-r-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <SearchIcon className="size-5"/>
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* desktop */}
            <form onSubmit={handleSearch} className="hidden sm:flex w-full max-w-[600px]">
                <div className="relative w-full">
                    <input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        type="text"
                        placeholder="Search"
                        className="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500"
                    />
                    {value && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setValue("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                        >
                            <XIcon className="text-gray-500"/>
                        </Button>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={!value.trim()}
                    className="px-5 py-2.5 bg-gray-100 border border-l-0 rounded-r-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SearchIcon className="size-5"/>
                </button>
            </form>
        </>
    );
}