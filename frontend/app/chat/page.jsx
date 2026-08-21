"use client"

import { useState } from "react"

import {
  ingestRepository,
  chatWithRepository
} from "@/services/api"


export default function ChatPage() {

  const [repoUrl, setRepoUrl] =
    useState("")

  const [query, setQuery] =
    useState("")

  const [answer, setAnswer] =
    useState("")

  const [loading, setLoading] =
    useState(false)


  async function handleIngest() {

    setLoading(true)

    try {

      await ingestRepository(
        repoUrl
      )

      alert(
        "Repository ingested successfully!"
      )

    } catch (error) {

      console.error(error)

      alert(
        "Failed to ingest repository"
      )

    }

    setLoading(false)
  }


  async function handleChat() {

    setLoading(true)

    try {

      const response =
        await chatWithRepository(
          query
        )

      setAnswer(
        response.answer
      )

    } catch (error) {

      console.error(error)

      alert(
        "Chat request failed"
      )

    }

    setLoading(false)
  }


  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial"
      }}
    >

      <h1>
        DevInsight AI Pro
      </h1>


      <div
        style={{
          marginTop: "30px"
        }}
      >

        <input
          type="text"

          placeholder=
            "GitHub Repository URL"

          value={repoUrl}

          onChange={(e) =>
            setRepoUrl(
              e.target.value
            )
          }

          style={{
            width: "400px",
            padding: "10px"
          }}
        />

        <button
          onClick={handleIngest}

          style={{
            marginLeft: "10px",
            padding: "10px"
          }}
        >
          Ingest Repository
        </button>

      </div>


      <div
        style={{
          marginTop: "40px"
        }}
      >

        <input
          type="text"

          placeholder=
            "Ask repository question"

          value={query}

          onChange={(e) =>
            setQuery(
              e.target.value
            )
          }

          style={{
            width: "400px",
            padding: "10px"
          }}
        />

        <button
          onClick={handleChat}

          style={{
            marginLeft: "10px",
            padding: "10px"
          }}
        >
          Ask AI
        </button>

      </div>


      {
        loading && (
          <p>
            Loading...
          </p>
        )
      }


      {
        answer && (
          <div
            style={{
              marginTop: "40px"
            }}
          >

            <h3>
              AI Answer
            </h3>

            <p>
              {answer}
            </p>

          </div>
        )
      }

    </div>
  )
}